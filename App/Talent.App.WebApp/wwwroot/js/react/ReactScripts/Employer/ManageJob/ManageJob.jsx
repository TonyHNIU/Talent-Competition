import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Card, Label, Button } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        //your functions go here
    };

    init() {
        //let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        //loaderData.isLoading = false;
        //this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        this.loadData(() =>
            this.setState({ loaderData }),
            loaderData.isLoading = false,
        )
        
        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
       // your ajax call and other logic goes here
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            data: {
                activePage: this.state.activePage,
                sortbyDate: this.state.sortBy.date,
                showActive: this.state.filter.showActive,
                showClosed: this.state.filter.showClosed,
                showDraft: this.state.filter.showDraft,
                showExpired: this.state.filter.showExpired,
                showUnexpired: this.state.filter.showUnexpired,
            },
            success: function (res) {
                console.log("res", res);
                if (res.myJobs) {
                    this.state.loadJobs = res.myJobs
                }
                console.log("Jobs", this.state.loadJobs);
                callback();
            }.bind(this),
            error: function (res) {
                console.log(res.status);
                callback();
            }
        })
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    render() {
        let list = this.state.loadJobs;
        let cardData = null;
        var currentDate = new Date();
        if (list != "") {
            cardData = list.map(card =>
                <Card key={card.id}>
                    <Card.Content>
                        <Card.Header>{card.title}</Card.Header>
                        <Label color='black' ribbon='right'><Icon name='user' />0</Label>
                        <Card.meta>{card.location.city}, {card.location.country}</Card.meta>
                        <Card.Description>{card.summary}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <span className="left floated">
                            {card.expiryDate > currentDate.toISOString() ?
                                <Label color="red">Expired</Label> : <label color="blue">Unexpired</label>
                            }
                        </span>
                        <span className="right floated">
                            <div className='ui three button'>
                                <Button basic color='blue'>Close</Button>
                                <Button basic color='blue'>Edit</Button>
                                <Button basic color='blue'>Copy</Button>
                            </div>
                        </span>
                    </Card.Content>
                </Card>
                )
        }
        else {
            cardData = "No Jobs Found";
        }

        const filterOptions = [
            { key: 'all', text: 'All', value: 'all' },
            { key: 'active', text: 'Active', value: 'active' },
            { key: 'closed', text: 'Closed', value: 'closed' },
            { key: 'draft', text: 'Draft', value: 'draft' },
            { key: 'expired', text: 'Expired', value: 'expired' },
            { key: 'unexpired', text: 'Unexpired', value: 'unexpired' },
        ]
        const sortOptions = [
            { key: 'newest', text: 'Newest first', value: 'newest' },
            { key: 'oldest', text: 'Oldest first', value: 'oldest' },
        ]

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <h2>List of Jobs</h2>              
                <div>
                    <span>
                        <Icon name='filter' />
                         Filter: &nbsp;&nbsp;
                        <Dropdown placeholder='Choose Filter' inline options={filterOptions} />
                    </span>
                    <span>
                        <Icon name='alternate outline calendar' />
                         Sort by Date: &nbsp;&nbsp;
                        <Dropdown inline options={sortOptions} defaultValue={sortOptions[0].value} />
                    </span>
                </div>
                    <br />
                    <div className="ui three column">
                        {cardData}
                    </div>
                    <br />
                    <div align='center'>
                        <Pagination totalPages='1' defaultActivePage='1' />
                    </div>
                    <br />
                </div>
            </BodyWrapper>
        )
    }
}