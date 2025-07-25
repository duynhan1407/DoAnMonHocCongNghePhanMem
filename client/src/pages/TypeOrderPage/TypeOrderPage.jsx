import React from 'react'
import NavbarComponent from '../../components/NavbarComponent/NavbarComponent'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Pagination, Row, Col } from 'antd'
import { WrapperNavbar, WrapperProducts } from './style'

const TypeOrderPage = () => {
    const onChange = () => {}
    return (
        <div style={{ padding: '0 120px', background: '#efefef'}}>
            <Row style={{ flexWrap: 'nowrap',  paddingTop: '10px'}}>
                <WrapperNavbar span={4}>
                    <NavbarComponent />
                </WrapperNavbar>
                <Col>
                    <WrapperProducts span={20}>
                        <CardComponent />
                    </WrapperProducts>
                </Col>
        </Row>
        <Pagination defaultCurrent={2} total={100} onChange={onChange} style={{ textAlign: 'center', marginTop: '10px'}} />
        </div>
    )
}

export default TypeOrderPage