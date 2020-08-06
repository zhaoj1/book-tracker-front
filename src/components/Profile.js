import React from 'react';
import Search from './Search';
import ProfileBookCard from './ProfileBookCard';
import OverallChart from './OverallChart';

export default class Profile extends React.Component{

  state = {
    analyticsData: [],
    dateRange: [],
    yRange: [],
    dateLabels: [],
    chartView: true,
    selectedPointId: null
  }
 
  componentDidMount = () => {
    this.props.fetchBooks();
    this.props.fetchPages();
  }

  componentDidUpdate = (prevProps) => {
    if(prevProps.modalIsOpen !== this.props.modalIsOpen){
      this.props.fetchBooks();
      this.props.fetchPages();
    }
  }

  render(){
    return(
      this.props.loggedIn ?
        this.props.currentUser ? 
          <div className='profile-page'>
            <h1>{this.props.currentUser.username}</h1>
            <div className='profile-analytics'>
              
              <div className='profile-overall-analytics'>

              </div>
            </div>
            <div className='profile-lower'>
              <div className='library'>
                {this.props.booksList !== undefined && this.props.booksList !== null && this.props.booksList.books !== undefined? 
                  this.props.booksList.books.map(book => 
                    <ProfileBookCard
                      ele={book}
                      setSelectedBook={this.props.setSelectedBook}
                    />
                  )
                  :
                  null
                }
              </div>
              <div className='search-box'>
                <Search 
                  setResults={this.props.setResults}
                />
              </div> 
            </div>
          </div>
          :
          null
        :
        <>{this.props.history.push('/')}</>
    )
  }
}