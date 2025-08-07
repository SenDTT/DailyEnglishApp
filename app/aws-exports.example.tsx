// src/aws-exports.example.js
const awsConfig = {
    aws_project_region: "<your-region>",
    aws_cognito_region: "<your-region>",
    aws_user_pools_id: "<your-pool-id>",
    aws_user_pools_web_client_id: "<your-client-id>",
    oauth: {
        domain: "<your-cognito-domain>",
        scope: ["email", "openid", "profile"],
        redirectSignIn: "<your-redirect-uri>",
        redirectSignOut: "<your-redirect-uri>",
        responseType: "code",
    },
};

export default awsConfig;
