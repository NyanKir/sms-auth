import React from "react"
import Head from "next/dist/next-server/lib/head"
import {useHttp} from '../hooks/http.hook'

function IndexPage() {
    const {request} = useHttp()

    const Exit = async (e) => {
        try {
            await request('api/logout', 'POST')
        } catch (e) {
            console.log('Server error', e)
        }
    }
    return (
        <>
            <Head>
                <title>Home</title>
                <meta property="og:title" content="My About page title" key="title"/>
            </Head>
            <nav className="navbar navbar-dark bg-dark">
                <a className="navbar-brand">Home</a>
                <form className="form-inline" onSubmit={Exit}>
                    <button className="btn btn-outline-light " type={"submit"}>Logout</button>
                </form>
            </nav>

        </>
    )
}

export default IndexPage;

export const getServerSideProps = async ({req, res}) => {
    const cookie = (req.cookies !== {}) ? req.cookies : undefined

    const respone = await fetch(`http://${process.env.HOST}:${process.env.PORT}/api/check`, {
        method: 'POST',
        headers: {
            'cookie': cookie.auth,
        },
    })

    if (respone.status === 401) {
        res.writeHead(302, {
            Location: '/login'
        });
        res.end();
        return {
            props: {}
        }
    }
    return {
        props: {}
    }


}
