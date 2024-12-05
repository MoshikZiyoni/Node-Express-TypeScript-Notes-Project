
const auth0Config = {

  // domain: process.env.REACT_APP_AUTO_0_DOMAIN_LOCAL || '',
  // clientId: process.env.REACT_APP_AUTO_0_CLIENTID_LOCAL || '',
  domain: process.env.REACT_APP_AUTO_0_DOMAIN_PRODUCTION || '',
  clientId: process.env.REACT_APP_AUTO_0_CLIENTID_PRODUCTION || '',
  redirectUri: window.location.origin,
};
export default auth0Config;
