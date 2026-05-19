import '../styles/globals.css';
import { useRouter } from 'next/router';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    const router = useRouter();
    const hideHeader = router.pathname.startsWith('/auth');
    return (
        <div>
            {!hideHeader && <Header currentUser={currentUser} />}
            <Component {...pageProps} />
        </div>
    );
};

AppComponent.getInitialProps = async appContext => {
    const client = buildClient(appContext.ctx);

    let data = { currentUser: null };
    try {
        const res = await client.get('/api/users/currentuser');
        data = res.data;
    } catch (err) {
        // Auth service may be unreachable during SSR (e.g. dev outside cluster). Fail soft.
        data = { currentUser: null };
    }

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    }
    return { ...data, pageProps };
}

export default AppComponent;