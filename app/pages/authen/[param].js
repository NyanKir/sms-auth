import React, {useEffect, useRef, useState} from "react";
import Head from "next/dist/next-server/lib/head";
import {Col, Container, Form, Row, Spinner} from "react-bootstrap";
import {useHttp} from "../../hooks/http.hook";
import {useRouter} from "next/router";


function AuthenticationPage(props) {
    const [code, setCode] = useState('')
    const itemRefs = useRef(null)
    const {request, loading} = useHttp()
    const router = useRouter()

    const [data, setData] = useState(undefined)
    useEffect(() => {
        if (code.length === 4) {
            const fetchData = async () => {
                try {
                    const data = await request('../api/auth', 'POST', JSON.stringify({
                        code: code,
                        user_id: props.param
                    }))
                    if (!data[1].ok) {
                        setData(data[0])
                    }
                    if (data[1].ok) {
                        await router.push('/')
                    }
                } catch (e) {
                    console.log('Server error', e)
                }
            }
            fetchData()
        }
    }, [code])

    useEffect(() => {
        itemRefs.current.focus()
        router.prefetch('/')

    }, [itemRefs])


    return (
        <>
            <Head>
                <title>Authentication</title>
                <meta property="og:title" content="My About page title" key="title"/>
            </Head>

            <Container>
                <Row className={'mt-4'}>
                    <Col md={{span: 4, offset: 4}}>
                        <Form>
                            <h2 className="text-center">Authentication</h2>

                            {
                                loading ?
                                    <div className='d-flex justify-content-center'>
                                        <Spinner animation="border" variant="primary"/>
                                    </div>
                                    :
                                    <Form.Group controlId="formBasicPhone">
                                        <Form.Label>Your code</Form.Label>
                                        <Form.Control type="password" maxLength="4" ref={itemRefs}
                                                      onChange={(event) => (!isNaN(event.target.value)) ? setCode(event.target.value) : ''}
                                                      value={code}/>
                                        <Form.Text className="text-muted">
                                            Please wait 2 minutes before re-authorization.
                                        </Form.Text>
                                    </Form.Group>
                            }


                        </Form>
                    </Col>
                    {
                        (data) ?
                            <Col>
                                <div className="alert alert-danger mt-4" role="alert">
                                    {data.message}
                                </div>
                                {(data.errors) ? data.errors.map((el, index) => {
                                    return (
                                        <div className="alert alert-danger mt-4" role="alert" key={index}>
                                            {el.msg}
                                        </div>)

                                }) : ''}

                            </Col>
                            : ''
                    }
                </Row>
            </Container>
        </>
    )
}
export default AuthenticationPage;


export async function getStaticPaths() {
    return {
        paths: [
            { params: { param: '1123321' } },
        ],
        fallback: true,
    };
}
export async function getStaticProps(context) {
    return {
        props: {
            ...context.params
        },
    }
}


