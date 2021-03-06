import React, {useEffect, useState} from 'react';
import {Alert, FlatList, TouchableOpacity} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Block, CustomButton, ImageComponent, Text} from '../components';
import {useNavigation} from '@react-navigation/native';
import {DrawerData} from '../utils/static-data';
import AsyncStorage from '@react-native-community/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {
  customerListRequest,
  loginSuccess,
  profileRequest,
} from '../redux/action';
import {
  strictValidObjectWithKeys,
  strictValidString,
} from '../utils/commonUtils';
import Switch from 'react-native-switch-pro';
import {config} from '../utils/config';
import axios from 'axios';
import {Alerts} from '../utils/commonUtils';
import {light} from '../components/theme/colors';
import messaging from '@react-native-firebase/messaging';

const DrawerScreen = ({state}) => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((v) => v.user.profile.user);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const newStatus = user.status === '1' ? true : false;
    setStatus(newStatus);
  }, [user]);

  const renderHeight = (icon) => {
    switch (icon) {
      case 'become_broker_icon':
        return 19;
      case 'terms_icon':
        return 19;
      case 'logout_icon':
        return 14.5;
      default:
        return 19.5;
    }
  };
  const renderWidth = (icon) => {
    switch (icon) {
      case 'become_broker_icon':
        return 19;
      case 'terms_icon':
        return 14;
      case 'logout_icon':
        return 19.5;
      case 'noti_icon':
        return 19.5;
      default:
        return 17.5;
    }
  };

  // const navigateHelpers = async (val) => {
  //   if (val === 'Login') {
  //     logout();
  //   } else {
  //     nav.navigate(val);
  //   }
  // };

  const _renderItem = ({item, index}) => {
    return (
      <CustomButton
        onPress={() => navigateHelpers(item.nav)}
        row
        center
        flex={false}
        color="transparent"
        padding={[hp(1.5), wp(5), hp(1.5), wp(5)]}>
        <Block flex={false} style={{width: wp(7)}}>
          <ImageComponent
            name={item.icon}
            height={renderHeight(item.icon)}
            width={renderWidth(item.icon)}
          />
        </Block>
        <Text size={16} semibold margin={[0, wp(8), 0, wp(5)]}>
          {item.name}
        </Text>
      </CustomButton>
    );
  };

  const getStatus = async (changeState = '') => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    axios({
      method: 'post',
      url: `${config.Api_Url}/user/broker-status`,
      headers,
      data: {
        status: changeState,
      },
    }).then((res) => {
      const newStatus = res.data === '1' ? true : false;
      dispatch(customerListRequest());
      dispatch(profileRequest());
      setStatus(newStatus);
    });
  };

  const onLogout = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };
    const res = await axios({
      method: 'get',
      url: `${config.Api_Url}/user/log-out`,
      headers,
    });
    if (res.data.status === 1) {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      await messaging().deleteToken(undefined, '*');
      dispatch(loginSuccess(''));
      nav.reset({
        routes: [{name: 'Auth'}],
      });
    } else {
      alert('invalid ');
    }
  };
  const navigateHelpers = async (val) => {
    if (val === 'Login') {
      try {
        Alert.alert(
          '',
          'Are you sure you want to log out ?',
          [
            {
              text: 'No',
            },
            {
              text: 'Yes',
              onPress: () => onLogout(),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      } catch (error) {}
    } else {
      nav.reset({
        routes: [{name: val}],
      });
    }
  };

  const changeStatus = (value) => {
    if (value) {
      getStatus('1');
      Alerts('You are Online', '', '#39B54A');
    } else {
      getStatus('2');
      Alerts('You are Offline', '', light.accent);
    }
  };
  return (
    <>
      <Block safearea>
        <Block
          secondary
          padding={[hp(4), wp(3), hp(4), wp(3)]}
          row
          center
          flex={false}>
          <Block row center>
            <Block
              flex={false}
              borderWidth={1}
              borderColor="#fff"
              borderRadius={60}>
              {strictValidObjectWithKeys(user) &&
              strictValidString(user.image) ? (
                <ImageComponent
                  isURL
                  name={`${config.Api_Url}/${user.image}`}
                  height="80"
                  width="80"
                  radius={80}
                />
              ) : (
                <ImageComponent
                  name="avatar"
                  height="80"
                  width="80"
                  radius={80}
                />
              )}
            </Block>
            <Block margin={[0, wp(4), 0, wp(4)]} flex={false}>
              <Text style={{width: wp(40)}} white bold>
                {strictValidObjectWithKeys(user) && user.name}
              </Text>
              <TouchableOpacity onPress={() => nav.navigate('Profile')}>
                <Text
                  margin={[hp(1), 0, 0, 0]}
                  bold
                  color="rgba(255,255,255,0.7)"
                  body>
                  View Profile
                </Text>
              </TouchableOpacity>
            </Block>
          </Block>
        </Block>
        <Block row flex={false} padding={[hp(1.5), wp(5), hp(1.5), wp(5)]}>
          <Text size={16} semibold>
            Status
          </Text>
          <Switch
            style={{marginLeft: wp(7)}}
            value={status}
            onSyncPress={(value) => {
              changeStatus(value);
            }}
          />
        </Block>
        <Block padding={[0, wp(2)]} flex={false}>
          <FlatList data={DrawerData} renderItem={_renderItem} />
        </Block>
      </Block>
    </>
  );
};
export default DrawerScreen;
