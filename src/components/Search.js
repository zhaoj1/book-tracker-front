import React from 'react';
import { Redirect } from "react-router-dom";

export default class Search extends React.Component{

  state = {
    queryParams: '',
    authorQuery: '',
    searched: false,
    error: false,
    errorMsg: ''
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  componentDidMount = () => {
    if(this.props.defaultSearch || this.props.defaultAuthor){
      this.setState({
        queryParams: this.props.defaultSearch,
        authorQuery: this.props.defaultAuthor
      })
    }
  }

  searchAPI = async (event) => {
    event.preventDefault();
    if(this.state.queryParams == '' && this.state.authorQuery == ''){
      this.setState({
        error: true,
        errorMsg: 'Please enter a query.'
      })
    }else{
      const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${this.state.queryParams}+author:${this.state.authorQuery}&maxResults=40&key=` + process.env.REACT_APP_GOOGLE_BOOKS_API_KEY)
      const json = await resp.json()
      if(json.totalItems == 0){
        this.setState({
          error: true,
          errorMsg: 'No results found. Please try again.'
        })
      }else{
        if(this.props.setDefaultSearch){
          this.props.setDefaultSearch(this.state.queryParams)
          this.props.setDefaultAuthor(this.state.authorQuery)
        }
        this.props.setResults(json)
        this.setState({
          searched: true,
          error: false,
          errorMsg: ''
        })
      }
    }
  }

  render(){
    return(
      <div className='search-container'>
        <div className='search'>
          <form 
          className='search-form'
            onSubmit={this.searchAPI}
          >
            <input 
              type='text' 
              name='queryParams' 
              className='search-input'
              placeholder='Search'
              value={this.state.queryParams} 
              onChange={this.handleChange}
            ></input>
            <input 
              type='text' 
              name='authorQuery' 
              className='search-input'
              placeholder='Author'
              value={this.state.authorQuery} 
              onChange={this.handleChange}
            ></input>
            <input 
              className='submitBtn' 
              type='submit' 
              value="Search"
            ></input>
            <img className='googleAttr' src='https://books.google.com/googlebooks/images/poweredby.png' />
          </form>
          {this.state.searched ? 
            <Redirect to='/results' />
            :
            null
          }
        </div>
        {this.state.error? 
          <p 
            className='errorMsg'
            style={{'margin-top':0}}
          >{this.state.errorMsg}</p>
          :
          null
        }
      </div>
    )
  }
}