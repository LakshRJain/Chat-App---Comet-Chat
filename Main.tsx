import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, SafeAreaView, Text, TouchableOpacity, ViewStyle } from 'react-native';
import {
  CometChatConversations,
  CometChatUIKit,
  CometChatUiKitConstants,
  UIKitSettings,
  CometChatThemeProvider,
  CometChatIncomingCall,
  CometChatCallLogs,
  CometChatCallButtons 
} from '@cometchat/chat-uikit-react-native';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import Messages from './Messages';

/* -------------------------------------------------------------------------- */
/*  ⚙️  Replace the placeholders below with your own CometChat credentials.    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */

/**
 * App
 * ---
 * The root component:
 *  1. Initializes the CometChat UI Kit.
 *  2. Logs a demo user in.
 *  3. Shows either the conversation list or an active chat screen.
 */
const Main = ({ UID,onLoginFail }: { UID: string ;onLoginFail:()=>void;}): React.ReactElement => {
  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const APP_ID = '27837076b1c8076c'; // e.g. "123456abc"
  const AUTH_KEY = '47fc7fd4c0d63350579c9ec691dc98c3c73217f6'; // e.g. "0b1c2d3e4f5g6h7i8j9k"
  const REGION = 'in'; // e.g. "us" | "eu" | "in"
  const DEMO_UID = UID; // e.g. "john_doe"
  const [loggedIn, setLoggedIn] = useState(false);
  const [messageUser, setMessageUser] = useState<CometChat.User>();
  const [messageGroup, setMessageGroup] = useState<CometChat.Group>();
  const [callReceived, setCallReceived] = useState(false);
  const [showCallLogs, setShowCallLogs] = useState(false);

  // Store the incoming call object for use in the UI
  const incomingCall = useRef<CometChat.Call | CometChat.CustomMessage | null>(
    null,
  );
  // Unique ID for registering and removing the call listener
  var listenerID: string = 'UNIQUE_LISTENER_ID';
  /* ------------------------------------------------------------------ */
  /* One-time initialization                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const init = async () => {
      // 1️⃣  Configure the UI Kit.
      const uiKitSettings: UIKitSettings = {
        appId: APP_ID,
        authKey: AUTH_KEY,
        region: REGION,
        subscriptionType: CometChat.AppSettings
          .SUBSCRIPTION_TYPE_ALL_USERS as UIKitSettings['subscriptionType'],
      };

      try {
        await CometChatUIKit.init(uiKitSettings);
        console.log('[CometChatUIKit] initialized');

        // 2️⃣  Login.
        await CometChatUIKit.login({ uid: DEMO_UID });
        setLoggedIn(true);
      } catch (err) {
        onLoginFail(); // 👈 return to login screen
        Alert.alert('Login failed', 'Invalid UID or network issue.');
      }
    };

    init();
  }, []);
  useEffect(() => {
    // Register the call listener when the component mounts or when login state changes
    CometChat.addCallListener(
      listenerID,
      new CometChat.CallListener({
        // Fired when an incoming call is received
        onIncomingCallReceived: (call: CometChat.Call) => {
          // Store the incoming call and update state.
          incomingCall.current = call;
          // Trigger UI to show incoming call screen
          setCallReceived(true);
        },
        // Fired when an outgoing call is rejected by the recipient
        onOutgoingCallRejected: () => {
          // Clear the call state if outgoing call is rejected.
          incomingCall.current = null; // Clear the call object
          setCallReceived(false); // Hide any call UI
        },
        onIncomingCallCancelled: () => {
          // Clear the call state if the incoming call is cancelled.
          incomingCall.current = null;
          setCallReceived(false);
        },
      }),
    );

    // Cleanup: remove the call listener when the component unmounts or before re-running
    return () => {
      CometChat.removeCallListener(listenerID);
    };
  }, [loggedIn]);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <SafeAreaView style={styles.fullScreen}>
      <CometChatThemeProvider>
        {/* Show conversations only after the user is logged in */}
        {loggedIn && (
          <>
            {callReceived && incomingCall.current ? (
              <CometChatIncomingCall
                call={incomingCall.current}
                onDecline={() => {
                  // Handle call decline by clearing the incoming call state.
                  incomingCall.current = null; // Clear the call object
                  setCallReceived(false); // Hide the incoming call UI
                }}
              />
            ) : null}
            {/* Conversation list (hidden when a chat is open) */}
            {!callReceived && (
              <>
                {!showCallLogs ? (
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
                          conversation.getConversationWith() as CometChat.User,
                        );
                        return;
                      }
                      setMessageGroup(
                        conversation.getConversationWith() as CometChat.Group,
                      );
                    }}
                  />
                ) : (
                  <>
                  <CometChatCallLogs />;
                  </>
                )}
                {!(callReceived || messageUser || messageGroup) &&  (
                  <TouchableOpacity onPress={() => setShowCallLogs(true)} style={{ margin: 10, padding: 10, backgroundColor: '#007AFF', borderRadius: 5 }}>
                  {!showCallLogs?(
                    <Text style={{ color: 'white', textAlign: 'center' }}>Call Logs</Text>
                  ):(
                    <Text style={{ color: 'white', textAlign: 'center' }}> Chats </Text>
                  )}
                  </TouchableOpacity>
                )}
                
                {/* Active chat screen */}
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
const styles: { fullScreen: ViewStyle } = {
  fullScreen: { flex: 1 },
};

export default Main;
