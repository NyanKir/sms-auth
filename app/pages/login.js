import React, {useState, useEffect} from "react"
import Head from "next/dist/next-server/lib/head"
import {Button, Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {useRouter} from "next/router";
import Link from "next/link";
import {useHttp} from '../hooks/http.hook'

function LoginPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const {request, loading} = useHttp()
    const [data, setData] = useState(undefined)



    const Login = async (e) => {
        try {
            e.preventDefault()
            const data = await request('api/login', 'POST', JSON.stringify({
                password: password,
                phone: phone
            }))
            console.log(data)
            if (!data[1].ok) {
                setData(data[0])
            }
            if (data[1].ok) {
                await router.push(`/authen/${data[0].id}`, undefined, {shallow: true})
            }
        } catch (e) {
            console.log('Server error', e)
        }
    }


    return (
        <>
            <Head>
                <title>Login</title>
                <meta property="og:title" content="My About page title" key="title"/>
            </Head>

            <Container>
                <Row className={'mt-4'}>
                    <Col md={{span: 4, offset: 4}} >
                        <Form onSubmit={Login}>
                            <h2 className="text-center">Login</h2>
                            <Form.Group controlId="formBasicPhone">
                                <Form.Label>Phone number</Form.Label>
                                <Form.Control type="tel" placeholder='Enter your phone number' value={phone}
                                              onChange={(e) => setPhone(e.target.value)} maxLength={12}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" value={password}
                                              onChange={(e) => setPassword(e.target.value)}/>
                            </Form.Group>
                            {loading ?
                                <div className='d-flex justify-content-center'>
                                    <Spinner animation="border" variant="primary"/>
                                </div>
                                :
                                <Button variant="primary" type="submit" size="lg" block>
                                    Submit
                                </Button>
                            }
                            <div className='mt-2 text-center'>
                                <Link href={'/signup'}><a>Sign up</a></Link>
                            </div>
                        </Form>
                    </Col>
                    {
                        (data) ?
                            <Col>
                                <div className="alert alert-danger mt-4" role="alert" >
                                    {data.message}
                                </div>
                                {(data.errors)?data.errors.map((el,index) => {
                                    return (
                                        <div className="alert alert-danger mt-4" role="alert" key={index}>
                                            {el.msg}
                                        </div>)

                                }):''}

                            </Col>
                            : ''
                    }
                </Row>
            </Container>
        </>
    )
}


export default LoginPage;

export const getServerSideProps = async ({req, res}) => {
    const cookie = (req.cookies !== {}) ? req.cookies : undefined
    const respone = await fetch(`http://${process.env.HOST}:${process.env.PORT}/api/check`, {
        method: 'POST',
        headers: {
            'cookie': cookie.auth,
        },
    })

    if (respone.status === 200) {
        res.writeHead(302, {
            Location: '/'
        });
        res.end();
        return {}
    }
    return {
        props: {}
    }
}
