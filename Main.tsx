import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {
  CometChatConversations,
  CometChatUIKit,
  CometChatUiKitConstants,
  UIKitSettings,
  CometChatThemeProvider,
  CometChatIncomingCall,
  CometChatCallLogs,
  CometChatCallButtons,
  CometChatUsers,
} from '@cometchat/chat-uikit-react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import Messages from './Messages';
import { defaultColorDark } from '@cometchat/chat-uikit-react-native/src/theme/default';
import { defaultColorLight } from '@cometchat/chat-uikit-react-native/src/theme/default';
import { darkThemeMaker } from '@cometchat/chat-uikit-react-native/src/theme/default/default';

const Main = ({ UID, onLoginFail }: { UID: string; onLoginFail: () => void }): React.ReactElement => {
  const APP_ID = '27837076b1c8076c';
  const AUTH_KEY = '47fc7fd4c0d63350579c9ec691dc98c3c73217f6';
  const REGION = 'in';
  const DEMO_UID = UID;

  const [loggedIn, setLoggedIn] = useState(false);
  const [messageUser, setMessageUser] = useState<CometChat.User>();
  const [messageGroup, setMessageGroup] = useState<CometChat.Group>();
  const [callReceived, setCallReceived] = useState(false);
  const [showCallLogs, setShowCallLogs] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  const incomingCall = useRef<CometChat.Call | CometChat.CustomMessage | null>(null);
  const listenerID: string = 'UNIQUE_LISTENER_ID';

  useEffect(() => {
    const init = async () => {
      const uiKitSettings: UIKitSettings = {
        appId: APP_ID,
        authKey: AUTH_KEY,
        region: REGION,
        subscriptionType: CometChat.AppSettings.SUBSCRIPTION_TYPE_ALL_USERS as UIKitSettings['subscriptionType'],
      };

      try {
        await CometChatUIKit.init(uiKitSettings);
        console.log('[CometChatUIKit] initialized');
        await CometChatUIKit.login({ uid: DEMO_UID });
        setLoggedIn(true);
      } catch (err) {
        onLoginFail();
        Alert.alert('Login failed', 'Invalid UID or network issue.');
      }
    };

    init();
  }, []);

  useEffect(() => {
    CometChat.addCallListener(
      listenerID,
      new CometChat.CallListener({
        onIncomingCallReceived: (call: CometChat.Call) => {
          incomingCall.current = call;
          setCallReceived(true);
        },
        onOutgoingCallRejected: () => {
          incomingCall.current = null;
          setCallReceived(false);
        },
        onIncomingCallCancelled: () => {
          incomingCall.current = null;
          setCallReceived(false);
        },
      })
    );

    return () => {
      CometChat.removeCallListener(listenerID);
    };
  }, [loggedIn]);
  const onPressHandler = (user: CometChat.User) => {
    setMessageUser(user);
    setShowUsers(false);
    setShowCallLogs(false);
  };
  return (
    <SafeAreaView style={styles.fullScreen}>
  <CometChatThemeProvider>
    {loggedIn && (
      <>
        {/* Incoming Call UI */}
        {callReceived && incomingCall.current ? (
          <CometChatIncomingCall
            call={incomingCall.current}
            onDecline={() => {
              incomingCall.current = null;
              setCallReceived(false);
            }}
          />
        ) : (
          <>
            {/* 🔝 Top Tab Bar */}
            

            {/* 📱 Main Views */}
            <SafeAreaView style={{ flex: 1 }}>
              {!showCallLogs && !showUsers && !showGroups ? (
                <CometChatConversations
                  style={{
                    containerStyle: {
                      display: messageUser || messageGroup ? 'none' : 'flex',
                    },
                  }}
                  onItemPress={(conversation: CometChat.Conversation) => {
                    if (
                      conversation.getConversationType() ===
                      CometChatUiKitConstants.ConversationTypeConstants.user
                    ) {
                      setMessageUser(
                        conversation.getConversationWith() as CometChat.User
                      );
                      return;
                    }
                    setMessageGroup(
                      conversation.getConversationWith() as CometChat.Group
                    );
                  }}
                />
              ) : showUsers ? (
                <CometChatUsers onItemPress={(user: CometChat.User) => {
                  setMessageUser(user);
                  setShowUsers(false);
                }} />
              ) : (
                <CometChatCallLogs />
              )}

              {(messageUser || messageGroup) && (
                <Messages
                  user={messageUser}
                  group={messageGroup}
                  onBack={() => {
                    setMessageUser(undefined);
                    setMessageGroup(undefined);
                  }}
                />
              )}
              {showUsers && !callReceived && !messageUser && !messageGroup && (
              <TouchableOpacity
                onPress={() => {
                  
                }}
                style={styles.fab}
              >
                <Text style={styles.fabText}>Groups</Text>
              </TouchableOpacity>
            )}

            </SafeAreaView>
            {!callReceived && !messageUser && !messageGroup && (
              <SafeAreaView style={styles.tabBar}>
                <TouchableOpacity
                  onPress={() => {
                    setShowCallLogs(false);
                    setShowUsers(false);
                  }}
                  style={[
                    styles.tabButton,
                    !showUsers && !showCallLogs && styles.activeTab,
                  ]}
                >
                  <Text style={styles.tabText}>Chats</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowUsers(true);
                    setShowCallLogs(false);
                  }}
                  style={[
                    styles.tabButton,
                    showUsers && styles.activeTab,
                  ]}
                >
                  <Text style={styles.tabText}>Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowCallLogs(true);
                    setShowUsers(false);
                  }}
                  style={[
                    styles.tabButton,
                    showCallLogs && styles.activeTab,
                  ]}
                >
                  <Text style={styles.tabText}>Calls</Text>
                </TouchableOpacity>
              </SafeAreaView>
            )}
          </>
        )}
      </>
    )}
  </CometChatThemeProvider>
</SafeAreaView>

  );
};

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */
const styles: {
  fullScreen: ViewStyle;
  tabBar: ViewStyle;
  tabButton: ViewStyle;
  activeTab: ViewStyle;
  tabText: TextStyle;
  fab:ViewStyle;
  fabText:TextStyle;
} = {
  fullScreen: {
    flex: 1,
    backgroundColor: 'white',
  },
  fab: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: defaultColorDark.extendedPrimary50,
  width: 56,
  height: 56,
  borderRadius: 18  ,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
},
fabText: {
  color: 'white',
  fontSize: 14,
  fontWeight: 'bold',
},

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor:defaultColorDark.background2 ,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tabButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    
    backgroundColor: defaultColorDark.background2,
  },
  activeTab: {
    backgroundColor: defaultColorDark.extendedPrimary50,
  },
  tabText: {
    color: 'white',
    fontWeight: '500',
    fontSize:16,
  },
};


export default Main;
