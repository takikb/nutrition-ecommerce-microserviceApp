import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return ( 
        <div>
            <Header currentUser={currentUser} />
            <Component {...pageProps} />
        </div>    
    )    
};

AppComponent.getInitialProps = async appContext => { // context === {Component, ctx: {req, res} } in custom App
    // This is where we can fetch data from the server during rendering the page
  const client = buildClient(appContext.ctx); // We can use the buildClient to make a request to the API and get the current user data
  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }
  return { ...data, pageProps };
}

export default AppComponent;