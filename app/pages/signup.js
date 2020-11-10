import React, {useEffect, useState} from "react"
import Head from "next/dist/next-server/lib/head"
import {useRouter} from 'next/router'
import {Form, Button, Container, Row, Col, Spinner} from 'react-bootstrap'
import Link from "next/link";
import {useHttp} from "../hooks/http.hook";

function RegistrationPage() {
    const router = useRouter()
    const {request, loading} = useHttp()


    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [r_password, setR_Password] = useState('')
    const [phone, setPhone] = useState('')
    const [data, setData] = useState(undefined)

    const goSignUp = async (e) => {
        try {
            e.preventDefault()
            const data = await request('api/register', 'POST', JSON.stringify({
                name: name,
                password: password,
                r_password: r_password,
                phone: phone
            }))
            if (!data[1].ok) {
                setData(data[0])
            }
            if (data[1].ok) {
                await router.push('/login')
            }
        } catch (e) {
            console.log('Server error', e)
        }
    }
    useEffect(() => {
        router.prefetch('/login')
    }, [])

    return (
        <>
            <Head>
                <title>Registration</title>
                <meta property="og:title" content="My About page title" key="title"/>
            </Head>
            <Container>
                <Row className={'mt-4'}>
                    <Col md={{span: 4, offset: 4}}>
                        <Form onSubmit={goSignUp}>
                            <h2 className="text-center">Sign up</h2>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="text" placeholder="Enter name" value={name}
                                              onChange={(e) => setName(e.target.value)}/>
                                <Form.Text className="text-muted">
                                    We'll never share your email with anyone else.
                                </Form.Text>
                            </Form.Group>
                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" value={password}
                                              onChange={(e) => setPassword(e.target.value)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicRepeatPassword">
                                <Form.Label>Repeat password</Form.Label>
                                <Form.Control type="password" placeholder="Repeat password" value={r_password}
                                              onChange={(e) => setR_Password(e.target.value)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicPhone">
                                <Form.Label>Phone number</Form.Label>
                                <Form.Control type="tel" placeholder='Enter your phone number' value={phone}
                                              onChange={(e) => setPhone(e.target.value)} maxLength={12}/>
                                <Form.Text className="text-muted">
                                    We'll never share your phone number with anyone else.
                                </Form.Text>
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
                                <Link href={'/login'}><a>Log in</a></Link>
                            </div>
                        </Form>
                    </Col>
                    {
                        (data) ?
                            <Col>
                                <div className="alert alert-danger mt-4" role="alert" >
                                    {data.message}
                                </div>
                                {data.errors.map((el,index) => {
                                    return (
                                        <div className="alert alert-danger mt-4" role="alert" key={index}>
                                            {el.msg}
                                        </div>)

                                })}

                            </Col>
                            : ''
                    }

                </Row>
            </Container>
        </>
    )
}


export default RegistrationPage;

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
