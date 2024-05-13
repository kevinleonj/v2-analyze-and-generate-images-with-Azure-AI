const axios = require('axios');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    const credential = new DefaultAzureCredential();

    const apiKeySecretUri = process.env['API_KEY_SECRET_URI']; // Replace with your environment variable
    const clientKey = new SecretClient(apiKeySecretUri, credential);
    const apiKey = await clientKey.getSecret(apiKeySecretUri);

    const endpointSecretUri = process.env['ENDPOINT_SECRET_URI']; // Replace with your environment variable
    const clientEndpoint = new SecretClient(endpointSecretUri, credential);
    const endpoint = await clientEndpoint.getSecret(endpointSecretUri);

    console.log(`API Key: ${apiKey.value}`);
    console.log(`Endpoint: ${endpoint.value}`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    
    const imageUrl = req.body && req.body.url;
    if (imageUrl) {
        try {
            const response = await axios.post(`${endpoint.value}/computervision/imageanalysis:analyze?api-version=2024-02-01&features=caption&model-version=latest&language=en&gender-neutral-caption=False`, 
                { url: imageUrl },
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': apiKey.value,
                        'Content-Type': 'application/json'
                    }
                }
            );

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: response.data.description.captions[0].text
            };
        } catch (error) {
            console.error(error);
            context.res = {
                status: 500,
                body: "An error occurred. Check the function logs for details."
            };
        }
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a url in the request body"
        };
    }
};