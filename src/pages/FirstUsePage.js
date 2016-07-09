import React from 'react';
import {
  Image,
  TextInput,
  View,
} from 'react-native';

import { Button, SyncState } from '../widgets';
import globalStyles, {
  SUSSOL_ORANGE,
  WARM_GREY,
} from '../globalStyles';

export class FirstUsePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 'uninitialised', // uninitialised, initialising, initialised, error
      progressMessage: '',
      serverURL: '',
      syncSiteName: '',
      syncSitePassword: '',
    };
    this.errorTimeoutId = null;
    this.onPressConnect = this.onPressConnect.bind(this);
    this.setProgress = this.setProgress.bind(this);
  }

  componentWillUpdate() {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
  }

  async onPressConnect() {
    try {
      this.setState({ progress: 'initialising' });
      await this.props.synchronizer.initialise(
        this.state.serverURL,
        this.state.syncSiteName,
        this.state.syncSitePassword,
        this.setProgress);
      this.setState({ progress: 'initialised' });
      this.props.onInitialised();
    } catch (error) {
      this.setState({ progress: 'error' });
      this.setProgress(error.message);
      if (!error.message.startsWith('Invalid username or password')) {
        // After ten seconds of displaying the error, re-enable the button
        this.errorTimeoutId = setTimeout(() => {
          this.setState({ progress: 'uninitialised' });
          this.errorTimeoutId = null;
        }, 10 * 1000);
      }
    }
  }

  setProgress(progressMessage) {
    this.setState({ progressMessage: progressMessage });
  }

  getButtonDisabled() {
    return (
      this.state.progress !== 'uninitialised' ||
      this.state.serverURL.length === 0 ||
      this.state.syncSiteName.length === 0 ||
      this.state.syncSitePassword.length === 0
    );
  }

  getButtonText() {
    switch (this.state.progress) {
      case 'initialising':
      case 'error':
        return this.state.progressMessage;
      case 'initialised':
        return 'Success!';
      default:
        return 'Connect';
    }
  }

  render() {
    return (
      <View style={[globalStyles.authFormContainer]}>
        <Image
          resizeMode="contain"
          style={globalStyles.authFormLogo}
          source={require('../images/logo_large.png')}
        />
        <TextInput
          style={globalStyles.authFormTextInputStyle}
          placeholderTextColor={SUSSOL_ORANGE}
          underlineColorAndroid={SUSSOL_ORANGE}
          placeholder="Primary Server URL"
          value={this.state.serverURL}
          editable={this.state.progress !== 'initialising'}
          onChangeText={ (text) => {
            this.setState({ serverURL: text, progress: 'uninitialised' });
          }}
        />
        <TextInput
          style={globalStyles.authFormTextInputStyle}
          placeholderTextColor={SUSSOL_ORANGE}
          underlineColorAndroid={SUSSOL_ORANGE}
          placeholder="Sync Site Name"
          value={this.state.syncSiteName}
          editable={this.state.progress !== 'initialising'}
          onChangeText={ (text) => {
            this.setState({ syncSiteName: text, progress: 'uninitialised' });
          }}
        />
        <TextInput
          style={globalStyles.authFormTextInputStyle}
          placeholder="Sync Site Password"
          placeholderTextColor={SUSSOL_ORANGE}
          underlineColorAndroid={SUSSOL_ORANGE}
          value={this.state.syncSitePassword}
          secureTextEntry
          editable={this.state.progress !== 'initialising'}
          onChangeText={ (text) => {
            this.setState({ syncSitePassword: text, progress: 'uninitialised' });
          }}
        />
        <SyncState
          style={globalStyles.initialisationStateIcon}
          isSyncing={this.state.progress === 'initialising'}
          syncError={this.state.progress === 'error' ? 'error' : ''}
          showText={false}
        />
        <View style={globalStyles.authFormButtonContainer}>
          <Button
            style={globalStyles.authFormButton}
            textStyle={globalStyles.authFormButtonText}
            text={this.getButtonText()}
            onPress={this.onPressConnect}
            disabledColor={WARM_GREY}
            isDisabled={this.getButtonDisabled()}
          />
        </View>
      </View>
    );
  }
}

FirstUsePage.propTypes = {
  onInitialised: React.PropTypes.func.isRequired,
  synchronizer: React.PropTypes.object.isRequired,
};
