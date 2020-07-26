import React from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries} from 'react-vis';
import moment from 'moment';

export default class ProfileBookDetails extends React.Component{

  state = {
    pagesRead: 0,
    dateRead: null,
    analyticsData: null,
    dateRange: [],
    yRange: [],
    dateLabels: []
  }

  componentDidMount = () => {
    this.updateData()
  }

  componentDidUpdate = (prevProps) => {
    if(prevProps.pages !== this.props.pages){
      this.updateData()
    }
  }

  updateData = () => {
    let date = new Date()
    this.props.pages.pages.filter(page => page.book == this.props.selectedBook.id).length == 0 ?
      this.setState({ 
        analyticsData : [{
          x : date,
          y : 0
        }],
        dateRange : [
          date,
          date.setDate(date.getDate() + 7)
        ] 
      })
      :
      this.calculateAnalytics()
  }

  calculateAnalytics = () => {
    let dataSet = {};
    let analyticsData = [];
    let dateRange = []
    let beginDate = new Date(this.props.pages.pages.filter(page => page.book == this.props.selectedBook.id)[0].dateRead + ' 00:00')
    let origin = new Date(beginDate)
    let originDate = origin.setDate(origin.getDate() - 1)
    let dateLabels = []

    this.props.pages.pages.filter(page => page.book == this.props.selectedBook.id).map(ele => {
      dataSet[ele.dateRead] ?
        dataSet[ele.dateRead] = dataSet[ele.dateRead] + ele.pagesRead
        :
        dataSet[ele.dateRead] = ele.pagesRead
    })

    Object.keys(dataSet).map(key => {
      let data = {}
      data['x'] = new Date(key + ' 00:00')
      data['y'] = dataSet[key]
      analyticsData.push(data)
    })
    
    analyticsData.unshift({
      x : new Date(originDate),
      y : 0
    })

    analyticsData.length <= 7 ?
      dateRange = [
        new Date(originDate),
        new Date(beginDate.setDate(beginDate.getDate() + 7))
      ]
      :
      dateRange = [
        new Date(originDate), 
        new Date(this.props.pages.pages.filter(page => page.book == this.props.selectedBook.id)[this.props.pages.pages.filter(page => page.book == this.props.selectedBook.id).length-1].dateRead + ' 00:00')
      ]

    var i = new Date(originDate).getTime()
    console.log(i)
    dateLabels.push(dateRange[0])
    let labelDiff = Math.round((dateRange[1] - dateRange[0]) / 7)
    while(i < dateRange[1].getTime()){
      let nextDate = new Date(i)
      nextDate.setDate(new Date(i).getDate() + labelDiff / (1000 * 60 * 60 * 24))
      dateLabels.push(nextDate)
      i += labelDiff
    }

    this.setState({
      analyticsData : analyticsData,
      dateRange: dateRange,
      yRange: [0, Math.max(...analyticsData.map(ele => ele.y)) + 1],
      dateLabels: dateLabels
    })
  }

  handleChange = (event) => {this.setState({[event.target.name]: event.target.value})}

  createPages = async (event) => {
    event.preventDefault()

    const resp = await 
    fetch(`http://127.0.0.1:8000/pages/`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${sessionStorage.getItem('token')}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        pagesRead: parseInt(this.state.pagesRead),
        dateRead: this.state.dateRead,
        book: this.props.selectedBook.id,
        owner: this.props.currentUser.id,
        username: this.props.currentUser.username,
      })
    })
    if(resp.ok){
      this.props.fetchPages();
      this.calculateAnalytics();
    }
  }

  deleteBook = () => {
    fetch(`http://127.0.0.1:8000/books/${this.props.selectedBook.id}`, {
      method: 'DELETE',
      headers: {'Authorization': `JWT ${sessionStorage.getItem('token')}`}
    }).then(this.props.closeModal()).then(this.props.fetchBooks())
  }

  render(){
    return(
      <div className='bookDetails'>
        <div className='bookDetails-left'>
          <img className='bookCover' src={this.props.selectedBook.imageLink} />
          <div className='bookInfo'>
            <label className='bookTitle'>
              {
                this.props.selectedBook.title.length >= 25 ? 
                  this.props.selectedBook.title.slice(0, 22) + '...'
                  :
                  this.props.selectedBook.title
              }
            </label><br></br>
            {this.props.selectedBook.authors}<br></br>
            <label className='bookISBN'>
              ISBN10: {this.props.selectedBook.isbn10}
            </label><br></br>
            <label className='bookISBN'>
              ISBN13: {this.props.selectedBook.isbn13}
            </label>
          </div>
        </div>
        <div className='bookDetails-right'>
          <div className='profileDetails-analytics'>
            <link rel="stylesheet" href="https://unpkg.com/react-vis/dist/style.css"></link>
            <XYPlot 
              width={500} 
              height={250}
              xType="time"
              xDomain={this.state.dateRange}
              yDomain={this.state.yRange}
              margin={{right:20}}
            >
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis 
                tickTotal={7}
                tickFormat={value => moment(value).format('MMM DD')}
                tickValues={this.state.dateLabels}
              />
              <YAxis />
              <LineSeries
                data={this.state.analyticsData}
              />
            </XYPlot>
          </div>
          <div className='profileDetails-pages'>
            <h2 className='pages_read'>Pages Read: {this.props.pages.pages !== null ?
                this.props.pages.pages.filter(page => page.book == this.props.selectedBook.id).reduce((acc, obj) => {return acc + obj.pagesRead}, 0)
                :
                null} / {this.props.selectedBook.totalPages}</h2>
            <form
              onSubmit={this.createPages}
            >
              <input
                type='text' 
                name='pagesRead' 
                onChange={this.handleChange}
                placeholder='Pages Read' 
                className='input'
                required
              >
              </input>
              <input
                type='date' 
                name='dateRead' 
                onChange={this.handleChange}
                className='input'
                required
              >
              </input><br></br>
              <input
                type='submit'
                className='submitBtn'
                value='Update'
              >
              </input>
            </form>
            <button onClick={this.deleteBook} className='submitBtn' >Delete</button>
          </div>
        </div>
      </div>
    )
  }
}