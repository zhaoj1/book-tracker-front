import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Landing from './Landing';
import Register from './Register';
import Login from './Login';

export default class Contents extends React.Component{

  state = {
    currentUser: null,
    loggedIn: false
  }

  setUser = (user) => {
    this.setState({currentUser: user, loggedIn: true})
  }

  render(){
    return(
      <div>
        <Router>
          <Switch>
            <Route exact path='/' render={(routerProps) => 
              <Landing 
                {...routerProps}
              />
            } />
            <Route exact path='/register' render={(routerProps) => 
              <Register 
                {...routerProps}
                setUser={this.setUser}
              />
            } />
            <Route exact path='/login' render={(routerProps) => 
              <Login 
                {...routerProps}
                setUser={this.setUser}
              />
            } />
          </Switch>
        </Router>
      </div>
    )
  }
}