import React, { Component, PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';

// DataInsert component - open modal and allow data insertion in table
export default class DataInsert extends Component {

    /**
     * Initialize state variables and bind this to methods
     */
    constructor(props) {
        super(props);

        // initialize state variables
        this.state = {
            showModal: false,
            option: "",
            criterion: "",
            optScore: 5
        };
        // make this available in these methods
        this.handleChangeOption = this.handleChangeOption.bind(this);
        this.handleChangeCriterion = this.handleChangeCriterion.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }

    /**
     * Main entry point
     */
    render() {
        // set the name / title
        var title = ' Add Option';

        if (this.props.level === 'col') {
            title = ' Add Criterion';
        }

        return (
                <a role="button" onClick={this.open}>{title}

                <div className='modal-example'>
                    <Modal className='modalStyle'
                        show={this.state.showModal}
                        onHide={this.close}>

                        <div className='dialogStyle'>
                            {this.createForm(title)}
                        </div>
                    </Modal>
                </div>
            </a>
        );
    }

    /**
     * Open the modal window
     */
    open(event) {
        this.setState({ showModal: true });
    }

    /**
     * Close the modal window
     */
    close() {
        this.setState({ showModal: false, option: "", criterion: "" });
    }

    /**
     * Handle the submit event of the form
     * triggers insertRow or insertColumn functions depending on level
     */
    handleSubmit(event) {
        event.preventDefault();

        if (this.props.level === "row") {
            this.addNewOption();
        }
        else {
            this.addNewCriterion();
        }

        //  Close form
        this.close();
    }

    /**
     * Define the form data based on the data and level
     * @returns the html for the form
     */
    createForm(title) {
        var formHtml = [];
        var classN = "";
        if (this.props.level === 'row') {
            formHtml = this.createFormForOption();
            if (this.state.option.trim().length === 0) {
                classN = "disabled";
            }
        }
        else {
            formHtml = this.createFormForCriterion();
            if (this.state.criterion.trim().length === 0) {
                classN = "disabled";
            }
        }

        return (
            <form className="new-data"
                onSubmit={this.handleSubmit}>
                <div className="content-form">
                    {formHtml}
                </div>
                <button key="button" type='submit' className={'btn btn-primary ' + classN}
                    data-toggle='title' data-placement='right' title={title}>
                    <i className='glyphicon glyphicon-plus' />{title}
                </button>
            </form>);
    }

    /**
     * Create the form for adding a new column based on the data that we have
     */
    createFormForCriterion() {
        var formHtml = [];
        var rows = this.props.data;

        // request the column name differently
        formHtml.push(<span key="header_text" className="input-text form-header">New Criterion Name:</span>);
        formHtml.push(<input key="header" type="text" ref="colName" className="form-header"
            value={this.state.criterion} onChange={this.handleChangeCriterion}
            placeholder="Type the new criteria name" autoFocus />);
        formHtml.push(<input type="number" name="score" key="header_score" ref="colName_score"
            className="form-header" min="0" max="10" defaultValue="5" autoComplete="off" />);

        // we have the ids for the input, so use that as a key 
        // request all the corresponding information
        if (this.state.criterion.trim().length !== 0) {
            for (var i = 0, len = rows.length; i < len; i++) {
                var inputInfo = this.state.criterion + " for " + rows[i][this.props.optionIdx].value;
                formHtml.push(<span key={rows[i]._id + "_text"} className="input-text">{inputInfo}:</span>);
                formHtml.push(<input key={rows[i]._id} type="text" ref={"textInput" + i}
                    placeholder={"Type to add data for " + inputInfo} />);
                formHtml.push(<input type="number" name="score" key={rows[i]._id + "_score"} ref={"textInput" + i + "_score"}
                    className="input-text" min="1" max="10" defaultValue="5" autoComplete="off" />);
            }
        }
        return formHtml;
    }

    /** 
     * Change the criterion name in the form dynamically 
     */
    handleChangeCriterion(event) {
        this.setState({ criterion: event.target.value });
    }

    /**
     * Insert the column data from the form into the table
     * only gets triggered when there's data in the table previously
     */
    addNewCriterion() {
        var rows = this.props.data;

        var colQuery = {
            name: ReactDOM.findDOMNode(this.refs.colName).value.trim(),
            score: ReactDOM.findDOMNode(this.refs.colName_score).value.trim()
        }

        var colId = new Meteor.Collection.ObjectID()._str;
        Meteor.call('comparison.insertColumn', colQuery, colId);

        for (var i = 0, len = rows.length; i < len; i++) {
            var dataQuery = {
                value: ReactDOM.findDOMNode(this.refs["textInput" + i]).value.trim(),
                score: ReactDOM.findDOMNode(this.refs["textInput" + i + "_score"]).value.trim()
            };
            Meteor.call('comparison.updateColumn', dataQuery, colId, rows[i]._id);
        }
    }

    /**
     * Create the form for adding a new row based on the data that we have
     */
    createFormForOption() {
        var formHtml = [];
        var cols = this.props.data;

        // request the "Option" header differently
        formHtml.push(<span key="header_text" className="input-text form-header" >New Option Name:</span>);
        formHtml.push(<input key="header" type="text" ref="textInput0" className="form-header"
            value={this.state.option} onChange={this.handleChangeOption}
            placeholder="Type to add new option name" autoFocus />);
        formHtml.push(<input type="text" name="score" key="header_score" ref="textInput0_score"
            className="form-header score-display" value={this.state.optScore} autoComplete="off" readOnly="true" />);

        // column headers are unique, so that can be the key
        // request all the corresponding information
        if (this.state.option.trim().length !== 0) {
            for (var i = 1, len = cols.length; i < len; i++) {
                var inputInfo = cols[i].name + " for " + this.state.option;
                formHtml.push(<span key={cols[i]._id + "_text"} className="input-text">{inputInfo}:</span>);
                formHtml.push(<input key={cols[i]._id} type="text" ref={"textInput" + i}
                    placeholder={"Type to add data for " + inputInfo} />);
                formHtml.push(<input type="number" name="score" key={cols[i]._id + "_score"}
                    ref={"textInput" + i + "_score"} className="input-text" min="1" max="10"
                    autoComplete="off" defaultValue="5" />);
            }
        }

        return formHtml;
    }

    /**  
     * Change the option name in the form dynamically
     */
    handleChangeOption(event) {
        this.setState({ option: event.target.value });
    }

    /**
     * Insert the row data from the form into the table
     */
    addNewOption() {
        var cols = this.props.data;
        var query = {};

        var headerId = "";
        if (cols.length !== 0) {
            headerId = cols[0]._id
        }
        else {
            headerId = new Meteor.Collection.ObjectID()._str;
            Meteor.call('comparison.insertFirstColumn', headerId);
        }

        query.score = ReactDOM.findDOMNode(this.refs.textInput0_score).value.trim();
        // get the header separately
        query[headerId] = {
            value: ReactDOM.findDOMNode(this.refs.textInput0).value.trim()
        };

        // Find the text field via the React ref
        for (var i = 1, len = cols.length; i < len; i++) {
            query[cols[i]._id] = {
                value: ReactDOM.findDOMNode(this.refs["textInput" + i]).value.trim(),
                score: ReactDOM.findDOMNode(this.refs["textInput" + i + "_score"]).value.trim()
            };
        }
        Meteor.call('comparison.insertRow', query);
    }
}

/**
  * data: provides form input
  * level: column/row
  * optionIdx: the index of the options item in cols
  */
DataInsert.propTypes = {
    data: PropTypes.array.isRequired,
    level: PropTypes.oneOf(['row', 'col']).isRequired,
    optionIdx: PropTypes.string
};