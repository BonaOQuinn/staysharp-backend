//imports SDK client for secrets manager
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

//read environment variables 
const region = process.env.AWS_REGION; //process.env reads environment variables 
const secretId = process.env.DB_SECRET_ID;

if (!region) {
  console.error("Missing AWS_REGION. Example: set AWS_REGION=us-west-2");
  process.exit(1);
}
if (!secretId) {
  console.error("Missing DB_SECRET_ID (secret name or ARN).");
  process.exit(1);
}

//creates SDK secret manager client 
const sm = new SecretsManagerClient({ region });

/*aws call: 
- sdk signs request using credentials 
- AWS verifies access
- secrets manager returns the secret value 
 */
const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));

// The secret is usually stored as a JSON string
console.log("SecretString:", resp.SecretString);


/* 
✅ AWS SDK is installed correctly
✅ Your SSO login works
✅ Your IAM permissions are correct
✅ Secrets Manager access works
✅ Your backend can securely fetch secrets
*/
