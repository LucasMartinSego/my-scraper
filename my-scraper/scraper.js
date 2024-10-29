const axios = require('axios');
const fs = require('fs');

function getProducts(data) {
    const products = data.variants;
    let json = [];

    products.map(el => {
        json.push({
            image: el.picture_thumb,
            sku: el.gp_sku,
            ean: el.ean_code,
            brand: el.product.manufacturer.name,
            price: el.product.sale_price,
            old_price: el.product.regular_price,
            title: el.product.title
        });
    });

    return json;
}

async function writeFile(data) {
    // Asegúrate de que los datos se escriban en el archivo
    return new Promise((resolve, reject) => {
        fs.appendFile('Products.json', JSON.stringify(data, null, 2) + ',\n', (e) => {
            if (e) reject("Error en escritura: " + e);
            else {
                console.log("Producto(s) agregado(s) a Products.json.");
                resolve();
            }
        });
    });
}

async function getApi(url) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {
            'Api-Key': 'J0NdKyZt9Kf96Eny96RMHQ'
        }
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.log("Error en la llamada a la API: ", error);
        return null;
    }
}

(async () => {
    let currentPage = 1;
    let lastPage = '';

    // Iniciar el archivo vacío
    fs.writeFileSync('Products.json', '[\n');

    do {
        const url = `https://api-bna.avenida.com/api/angular_app/search/tecnologia-computacion?p=${currentPage}`;
        const apiData = await getApi(url);

        console.info(url);

        if (apiData) {
            const products = getProducts(apiData);
            await writeFile(products); // Esperar a que se complete la escritura

            currentPage++;
            lastPage = apiData.pagination.total_pages;
        }
    } while (currentPage <= lastPage); // Cambia < por <= para incluir la última página

    // Finalizar el archivo JSON
    fs.appendFileSync('Products.json', '\n]'); // Cerrar el array JSON
})();
