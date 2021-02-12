import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './colors';
import * as constants from '../config/constants';

const { width, height } = Dimensions.get('window');

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    padding: constants.defaultPadding,
  },
  defaultText: {
    color: colors.primaryText,
  },
  defaultBorder: {
    borderWidth: 1, 
    borderColor: colors.primary,
  },
  toggleButtonView: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height > 600 ? 48 : 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.white,
    marginTop: constants.viewSpacing,
    marginBottom: constants.viewSpacing,
  },
  toggleButtonSelected: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height > 600 ? 48 : 40,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.primary,
    marginTop: constants.viewSpacing,
    marginBottom: constants.viewSpacing,
  },
  toggleButtonText: {
    fontSize: width > 360 ? 14 : 12,
    color: colors.primaryText,
  },
  toggleButtonTextSelected: {
    fontSize: width > 360 ? 14 : 12,
    color: colors.primary,
  },
  loadingView: {
    backgroundColor: colors.background,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: constants.defaultPadding,
  },
  errorView: {
    backgroundColor: colors.background,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: constants.defaultPadding,
  },
  errorTitle: {
    color: colors.primaryText,
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 40,
  },
  errorMessage: {
    color: colors.primaryText,
    fontSize: 20,
    textAlign: 'center',
  },
  line: {
    flexGrow: 1,
    height: 1,
    marginVertical: constants.viewSpacing,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
});
