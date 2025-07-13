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
  CometChatUsers,
  CometChatGroups,
} from '@cometchat/chat-uikit-react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import Messages from './Messages';
import { defaultColorDark } from '@cometchat/chat-uikit-react-native/src/theme/default';

const Main = ({
  UID,
  onLoginFail,
}: {
  UID: string;
  onLoginFail: () => void;
}): React.ReactElement => {
  const APP_ID = '27837076b1c8076c';
  const AUTH_KEY = '47fc7fd4c0d63350579c9ec691dc98c3c73217f6';
  const REGION = 'in';

  const [loggedIn, setLoggedIn] = useState(false);
  const [messageUser, setMessageUser] = useState<CometChat.User>();
  const [messageGroup, setMessageGroup] = useState<CometChat.Group>();
  const [callReceived, setCallReceived] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'chats' | 'users' | 'groups' | 'calls'>('chats');

  const incomingCall = useRef<CometChat.Call | CometChat.CustomMessage | null>(null);
  const listenerID: string = 'UNIQUE_LISTENER_ID';

  useEffect(() => {
    const init = async () => {
      const uiKitSettings: UIKitSettings = {
        appId: APP_ID,
        authKey: AUTH_KEY,
        region: REGION,
        subscriptionType:
          CometChat.AppSettings.SUBSCRIPTION_TYPE_ALL_USERS as UIKitSettings['subscriptionType'],
      };

      try {
        await CometChatUIKit.init(uiKitSettings);
        console.log('[CometChatUIKit] initialized');
        await CometChatUIKit.login({ uid: UID });
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

  return (
    <SafeAreaView style={styles.fullScreen}>
      <CometChatThemeProvider>
        {loggedIn && (
          <>
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
                <SafeAreaView style={{ flex: 1 }}>
                  {(() => {
                    if (messageUser || messageGroup) {
                      return (
                        <Messages
                          user={messageUser}
                          group={messageGroup}
                          onBack={() => {
                            setMessageUser(undefined);
                            setMessageGroup(undefined);
                          }}
                        />
                      );
                    }

                    switch (activeScreen) {
                      case 'users':
                        return (
                          <>
                            <CometChatUsers
                              onItemPress={(user: CometChat.User) => {
                                setMessageUser(user);
                              }}
                            />
                            <TouchableOpacity
                              onPress={() => setActiveScreen('groups')}
                              style={styles.fab}
                            >
                              <Text style={[styles.fabText, styles.fabTextPadding]}>
                                Groups
                              </Text>
                            </TouchableOpacity>
                          </>
                        );

                      case 'groups':
                        return (
                          <>
                          <CometChatGroups
                            onItemPress={(group: CometChat.Group) => {
                              setMessageGroup(group);
                            }}
                          />
                          <TouchableOpacity
                              onPress={() => setActiveScreen('users')}
                              style={styles.fab}
                            >
                              <Text style={[styles.fabText, styles.fabTextPadding]}>
                                Users
                              </Text>
                            </TouchableOpacity>
                          </>
                        );

                      case 'calls':
                        return <CometChatCallLogs />;

                      case 'chats':
                      default:
                        return (
                          <CometChatConversations
                            style={{
                              containerStyle: {
                                display: 'flex',
                              },
                            }}
                            onItemPress={(conversation: CometChat.Conversation) => {
                              const type = conversation.getConversationType();
                              const withObj = conversation.getConversationWith();
                              if (
                                type === CometChatUiKitConstants.ConversationTypeConstants.user
                              ) {
                                setMessageUser(withObj as CometChat.User);
                              } else {
                                setMessageGroup(withObj as CometChat.Group);
                              }
                            }}
                          />
                        );
                    }
                  })()}
                </SafeAreaView>

                {!callReceived && !messageUser && !messageGroup && (
                  <SafeAreaView style={styles.tabBar}>
                    {['chats', 'users', 'calls'].map((screen) => (
                      <TouchableOpacity
                        key={screen}
                        onPress={() => setActiveScreen(screen as any)}
                        style={[
                          styles.tabButton,
                          activeScreen === screen && styles.activeTab,
                        ]}
                      >
                        <Text style={styles.tabText}>
                          {screen.charAt(0).toUpperCase() + screen.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
  fab: ViewStyle;
  fabText: TextStyle;
  fabTextPadding: TextStyle;
} = {
  fullScreen: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: defaultColorDark.background2,
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
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: defaultColorDark.extendedPrimary50,
    width: 100,
    height: 56,
    borderRadius: 18,
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
  fabTextPadding: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
};

export default Main;
