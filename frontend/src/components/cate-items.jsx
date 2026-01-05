import { useEffect, useState } from "react"
import '../pages/Home.css'
import { useParams } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Header from "./Navbar";
import { CateOption } from "../pages/home";
import AuthStore from "../AuthStore";
import api from "../Axios/Script";

function DisplayCategory() {

    const { name } = useParams()
    const { token } = AuthStore()
    const [cateItems, setcateItems] = useState([])
    const getcateItems = async () => {
        let res = await api.get(`/cateItem/${name}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
        let data = await res.data
        setcateItems(data)
    }

    useEffect(() => {
        getcateItems()
    }, [{ name }])

    return <>
        <Header />
        <CateOption token={token} />

        <h2>{name}</h2>
        {
            cateItems.map(item => <>
                <div>
                    <Card className="card" >
                        <ListGroup variant="flush">
                            <ListGroup.Item><img style={{ width: '13rem', height: '10rem' }} src={item.image}></img></ListGroup.Item>
                            <ListGroup.Item>{item.name}</ListGroup.Item>
                            <ListGroup.Item>{item.price}</ListGroup.Item>
                            <ListGroup.Item>
                                {item?.category?.name ?? "no category"}
                            </ListGroup.Item>
                            <button onClick={() => {
                                console.log(item)
                                add(item)
                            }}>ADD TO CART</button>
                            {/* <ListGroup.Item><button onClick={() => deleteItem(item._id)}>DELETE</button></ListGroup.Item> */}

                        </ListGroup>
                    </Card>

                </div>
            </>)
        }
    </>
}

export default DisplayCategory