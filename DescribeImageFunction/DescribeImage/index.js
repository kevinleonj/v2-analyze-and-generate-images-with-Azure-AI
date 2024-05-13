const axios = require('axios');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

module.exports = async function (context, req) {
    const vaultName = process.env['KEY_VAULT_NAME'];
    const kvUri = `https://${vaultName}.vault.azure.net`;

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(kvUri, credential);

    const apiKeySecretName = "ComputerVisionChallengeLink";
    const apiKey = await client.getSecret(apiKeySecretName);

    const endpointSecretName = "ComputerVisionChallengeSecret";
    const endpoint = await client.getSecret(endpointSecretName);

    const imageUrl = req.body && req.body.url;
    if (imageUrl) {
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
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a url in the request body"
        };
    }
    console.log(response.data);
};