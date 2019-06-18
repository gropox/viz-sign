import queryString from "query-string";
import React, { Component } from 'react';
import './App.css';

import TransactionView from "./TransactionView";

import "bootstrap/dist/css/bootstrap.css"
import { Transaction } from "../service/operation";
import ErrorsView from "./ErrorsView";
import viz from "viz-js-lib";

import sanatizer from "@braintree/sanitize-url";

function checkWorkingNode() {
    const NODES = [
        "wss://solox.world/ws",
        "wss://vizlite.lexai.host/",
    ];
    let node = localStorage.getItem("node") || NODES[0];
    const idx = Math.max(NODES.indexOf(node), 0);
    let checked = 0;
    const find = (idx) => {
        if (idx >= NODES.length) {
            idx = 0;
        }
        if (checked >= NODES.length) {
            alert("no working nodes found");
            return;
        }
        node = NODES[idx];
        console.log("check", idx, node);
        viz.config.set("websocket", node);
        try {
            viz.api.stop();
        } catch(e) {
        }
        
        let timeout = false;
        let timer = setTimeout(() => {
            console.log("timeout", NODES[idx])
            timeout = true;
            find(idx + 1);
        }, 3000);
        viz.api.getDynamicGlobalPropertiesAsync()
            .then(props => {
                if(!timeout) {
                    check = props.head_block_number;
                    console.log("found working node", node);
                    localStorage.setItem("node", node);
                    clearTimeout(timer);
                }
            })
            .catch(e => {
                console.log("connection error", node, e);
                find(idx + 1);
            });
    }
    find(idx);
}
checkWorkingNode();

const ErrorMessage = (props) => {
    return (
        <div className="mt-5 mb-5 alert alert-danger" role="alert">
            <h4>{props.error}</h4>
        </div>
    );
}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            transaction: null,
            errors: null,
            error: null
        }
    }

    componentDidMount() {
        const params = queryString.parse(window.location.search);
        const title = (params["title"] || "Визирь");
        const subtitle = (params["subtitle"]);
        const nowif = Object.keys(params).includes("nowif");
        const user = params["user"];
        let redirect = sanatizer.sanitizeUrl(params["redirect"] || "");

        if(redirect === "about:blank") {
            redirect = null;
        }

        let tr = params["tr"];
        if (!tr) {
            console.log("Не найден URL параметр tr");
            this.setState({ title, subtitle, error: "Вызов без параметров" });
            return;
        }

        try {
            //Пробуем распарсить json
            let json = null;
            try {
                json = JSON.parse(tr);
            } catch (error) {
                console.log("not valid json", tr);
                this.setState({ title, subtitle, error: "Переданная транзакция не является валидным JSON" });
                return;
            }
            //Проверка транзакции на валидность
            const transaction = new Transaction(json);
            this.setState({ transaction, title, subtitle, user, nowif, redirect });
        } catch (errors) {
            //обнаружены ошибки
            console.log("found errors", errors)
            this.setState({ errors });
        }
    }

    render() {

        let content = null;
        if (this.state.transaction) {
            content = <TransactionView redirect={this.state.redirect} nowif={this.state.nowif} user={this.state.user} transaction={this.state.transaction} />
        } else if (this.state.error) {
            content = <ErrorMessage error={this.state.error} />
        } else if (this.state.errors) {
            content = <ErrorsView errors={this.state.errors} />
        }

        return (
            <div className="container App">
                {<div className="row">
                    <div className="col-sm-12">
                        <nav className="navbar navbar-light " >
                            <div>
                                <h3>{this.state.title}</h3>
                                {this.state.subtitle && <h5>{this.state.subtitle}</h5>}
                                <br /><small>Подпись транзакции VIZ
                                <a rel="noopener noreferrer" target="_blank" href="http://golos.io/@ropox/sign">&nbsp;<span className="rounded-circle bg-info text-white font-weight-bold">&nbsp;?&nbsp;</span></a></small>
                            </div>
                        </nav>
                    </div>
        </div>}
                <div className="row">
                    <div className="col-sm-12">
                        {content}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
