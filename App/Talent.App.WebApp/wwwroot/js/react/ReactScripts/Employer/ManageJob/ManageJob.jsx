import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Header, Card, Label, Button } from 'semantic-ui-react';


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
                showUnexpired: true,
            },
            totalPages: 1,
            activeIndex: "",
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
    };

    init() {
        //let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        //loaderData.isLoading = false;
        //this.setState({ loaderData });//comment this
        //set loaderData.isLoading to false after getting data
        this.loadData(() => {
            let loaderData = TalentUtil.deepCopy(this.state.loaderData);
            loaderData.isLoading = false;
            this.setState({ loaderData });
        }
        )
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'http://localhost:51689/listing/listing/getSortedEmployerJobs',
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
                showUnexpired: this.state.filter.showUnexpired
            },
            success: function (res) {
                if (res.myJobs) {
                    this.state.loadJobs = res.myJobs
                }
                console.log("result Jobs", this.state.loadJobs);
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
        let jobList = this.state.loadJobs;
        let totalPages = this.state.totalPages;
        let activeIndex = this.state.activeIndex;
        let jobDetails = null;
        const filterOptions = [
            { key: 'Choose Filter', text: 'Choose Filter', value: 'Choose Filter' },
            { key: 'showActive', text: 'Active Jobs', value: 'showActive' },
            { key: 'showClosed', text: 'Closed Jobs', value: 'showClosed' },
            { key: 'showExpired', text: 'Expired Jobs', value: 'showExpired' },
            { key: 'showUnexpired', text: 'Unexpired Jobs', value: 'showUnexpired' }
        ];

        const sortOptions = [
            { key: 'newestJobs', text: 'Newest First', value: 'newestJobs' },
            { key: 'oldestJobs', text: 'Oldest First', value: 'oldestJobs' }
        ];

        if (jobList != "") {
            jobDetails = jobList.map((item) => (
                <JobSummaryCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    summary={item.summary}
                    country={item.location.country}
                    city={item.location.city}
                />
            )
            )
        }
        else {
            jobDetails = <div> No Jobs Found</div>;
            totalPages = 0;
        }


        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <h1>List of Jobs</h1>
                    <span>
                        <Icon name='filter' />
                        Filter:
                        <Dropdown inline options={filterOptions}/>
                    </span>
                    <span>
                        <Icon name='calendar alternate' />
                        Sort by date:
                        <Dropdown inline options={sortOptions}/>
                    </span>
                    <br /> <br />
                    <Card.Group itemsPerRow={3}>
                        {jobDetails}
                    </Card.Group>
                    <br /><br />
                    <div style={{ textAlign: "center" }}>
                        <Pagination
                            defaultActivePage={activeIndex}
                            ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                            firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                            lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                            prevItem={{ content: <Icon name='angle left' />, icon: true }}
                            nextItem={{ content: <Icon name='angle right' />, icon: true }}
                            totalPages={totalPages}
                        />
                    </div>
                    <br /><br /><br />
                </div>
            </BodyWrapper>
        );
    }
}