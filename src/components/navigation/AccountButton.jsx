import React from "react";
import { push, Link } from "gatsby";
import firebase from "../../firebase/init";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button"

import {
  userLoggedIn,
  userLoggedOut,
  toggleNewPageModal,
  deploy,
  toggleEditing
} from "../../redux/actions";

import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

const styles = {
  container: {
    position: "fixed",
    left: "10px",
    bottom: "10px",
    zIndex: "1000",
  },
  iconLabel: {
    display: "flex",
    alignItems: "center"
  }
};

class AccountButton extends React.Component {
  state = {
    anchorEl: null
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const ref = firebase
          .app()
          .firestore()
          .collection('users')
          .doc(user.uid);

        ref.get().then(snapshot => {
          const userData = snapshot.data();
          if (userData) {
            this.props.userLoggedIn(userData);
          } else {
            const newUser = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL
            };
            ref.set(newUser);
            this.props.userLoggedIn(newUser);
          }
        });
      } else {
        this.props.userLoggedOut();
      }

      if (this.props.showRegistrationModal) {
        this.props.onToggleRegistrationModal();
      }
    });
  }

  logout = e => {
    firebase.auth().signOut();
    this.props.userLoggedOut();
    push("/");
  };

  login = e => {
    this.props.onToggleRegistrationModal();
  };

  openMenu = e => {
    this.setState({ anchorEl: e.currentTarget });
  };

  closeMenu = e => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { props, openMenu, closeMenu, logout } = this;
    const { anchorEl } = this.state;

    if (props.isLoggedIn) {
      const accountName = props.user.displayName
        ? props.user.displayName
        : "Account";
      const toggleText = props.isEditingPage ? "Done editing" : "Edit page";
      return (
        <div style={styles.container}>
          <Button
            variant="contained"
            onClick={openMenu}
            aria-owns={anchorEl ? "account-menu" : null}
            aria-haspopup="true"
          >
            <span style={styles.iconLabel}>
              {accountName}
              <ArrowDropDown style={{ height: "14px" }} />
            </span>
          </Button>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
          >
            {props.allowEditing && (
              <MenuItem
                onClick={() => {
                  props.onToggleEditing();
                  closeMenu();
                }}
              >
                {toggleText}
              </MenuItem>
            )}

            {props.allowEditing && (
              <MenuItem
                onClick={() => {
                  props.onToggleNewPageModal({ edit: true });
                  closeMenu();
                }}
              >
                Page configuration
              </MenuItem>
            )}

            {props.allowEditing && (
              <MenuItem
                onClick={() => {
                  props.onToggleNewPageModal({ new: true });
                  closeMenu();
                }}
              >
                Add new page
              </MenuItem>
            )}

            {props.allowEditing && props.allowDuplicate && (
              <MenuItem
                onClick={() => {
                  props.onToggleNewPageModal({ duplicate: true });
                  closeMenu();
                }}
              >
                Duplicate page
              </MenuItem>
            )}

            {props.allowEditing && props.allowDuplicate && (
              <MenuItem
                onClick={() => {
                  props.onToggleNewPageModal({ translation: true });
                  closeMenu();
                }}
              >
                Translate page
              </MenuItem>
            )}

            {props.allowEditing && (
              <MenuItem
                onClick={() => {
                  closeMenu();
                }}
                component={Link}
                to={'/admin'}
              >
                Website configuration
              </MenuItem>
            )}

            {props.allowEditing && (
              <MenuItem
                onClick={() => {
                  props.deploy();
                  closeMenu();
                }}
              >
                Publish changes
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                logout();
                closeMenu();
              }}
              divider
            >
              Log out
            </MenuItem>
          </Menu>
        </div>
      );
    }

    return null
  }
}

const mapStateToProps = state => {
  const allowEditing = state.adminTools.user && state.adminTools.user.isEditor;
  const allowDuplicate = state.page.data && state.page.data.template;

  return {
    isLoggedIn: state.adminTools.isLoggedIn,
    user: state.adminTools.user,
    showRegistrationModal: state.adminTools.showRegistrationModal,
    isEditingPage: state.adminTools.isEditingPage,
    allowEditing: allowEditing,
    allowDuplicate: allowDuplicate,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    userLoggedIn: user => {
      dispatch(userLoggedIn(user));
    },
    userLoggedOut: () => {
      dispatch(userLoggedOut());
    },
    onToggleNewPageModal: (options={}) => {
      dispatch(toggleNewPageModal(options));
    },
    onToggleEditing: () => {
      dispatch(toggleEditing());
    },
    deploy: () => {
      dispatch(deploy());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountButton);
