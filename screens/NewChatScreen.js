import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView, ScrollView, SectionList, StyleSheet, Text, View, Image, Button, TextInput } from 'react-native';
import { db, storage } from '../firebase';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { SearchBar } from 'react-native-elements';
import { Video, Audio } from 'expo-av';

const NewChatScreen = ({ navigation }) => {

    const [searchByShopCode, setSearchByShopCode] = React.useState('');
    const [hideShowChat, setHideShowChat] = useState("hide");


    const unsubFromMessagesRef = React.useRef();

    const [messages, setMessages] = useState([]);
    const [titleText, setTitleText] = useState("");
    const [shopCodeText, setShopCodeText] = useState("");
    const [shopNameText, setShopNameText] = useState("");
    const [chatText, setChatText] = useState("");
    const [menuText, setMenuText] = useState("");


    var shopCode = ''
    var chatName = ''
    var menuChat = ''

    const insertChatLog = async (getchatText, getmenuChat) => {
        // alert("chatName" + chatName + '  shopCode ' + shopCode + ' menu ' + menuChat)
        var Data = {
            shopcode: 'admin',
            chatname: getchatText,
            menu: getmenuChat,
            status: 'unread'
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/insert_chat_log_test.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            if (json[0].Message == 'Complete') {
                //  getUser()
            }
            // alert(json[0].Message)
        } catch (error) {
            //   alert(error)
            console.error(error)
        }
    }

    const onSend = useCallback((messages = [], getchatText, getmenuChat) => {
        //alert("chatName" + chatName + '  shopCode ' + shopCode + ' menu ' + menuChat)
        //  alert("chatText " + chatText)
        insertChatLog(getchatText, getmenuChat)
        //   setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        const {
            _id,
            createdAt,
            text,
            user,
            received
        } = messages[0]
        db.collection(getchatText).add({
            _id,
            createdAt,
            text,
            user,
            received: false
        })

    }, [])

    const updateChatLog = async (shopname, shopcode, chatname, menu) => {
        var Data = {
            shopcode: shopcode,
            chatname: chatname,
            status: 'read'
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/update_chat_log_web.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
        } catch (error) {
            //   alert(error)
            console.error(error)
        }
        onPressTitle(shopname, shopcode, chatname, menu)

    }

    const onPressTitle = (shopname, shopcode, chatname, menu) => {
        chatName = chatname;
        shopCode = shopcode;
        menuChat = menu;
        let getTitle = shopcode + ' (' + shopname + ')'

        setTitleText(getTitle);
        setChatText(chatName);
        setShopCodeText(shopCode);
        setShopNameText(shopname);
        setMenuText(menuChat);
        unsubFromMessagesRef.current && unsubFromMessagesRef.current();
        readUser(shopcode, chatName)
    };

    const readUser = async (getshopcode, getchatName) => {
        const cityRef = db.collection(getchatName).where("user._id", "==", getshopcode)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({ received: true })
                });
            })

        const unsubFromMessages = db.collection(getchatName).orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            unsubFromMessagesRef.current = unsubFromMessages;
            setMessages(
                snapshot.docs.map(doc => ({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user,
                    image: doc.data().image,
                    video: doc.data().video,
                    received: doc.data().received
                }))
            )
        });

    }

    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const [urls, setUrls] = useState([]);
    const [progress, setProgress] = useState(0);

    const handleChange = (e) => {
        setImages([]);
        setUrls([]);
        console.log('handleChange2 ==== ', e.target.files.length)
        for (let i = 0; i < e.target.files.length; i++) {
            const newImage = e.target.files[i];
            newImage["id"] = Math.random();
            
            setImages((prevState) => [...prevState, newImage]);
        }
    };

    const handleUpload = async () => {
        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        var hours = new Date().getHours(); //Current Hours
        var min = new Date().getMinutes(); //Current Minutes
        var sec = new Date().getSeconds(); //Current Seconds

        const filename = 'admin_' + year + month + date + hours + min + sec

        const promises = [];
        images.map((image) => {
            const uploadTask = storage.ref(`images/${filename}`).put(image);

            promises.push(uploadTask);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setProgress(progress);
                },
                (error) => {
                    console.log(error);
                },
                async () => {
                    await storage
                        .ref("images")
                        .child(filename)
                        .getDownloadURL()
                        .then((urls) => {
                            uploadImagePicked(urls)
                            setUrls((prevState) => [...prevState, urls]);
                        });
                }
            );
            //  uploadImagePicked()
        });

        /*
                Promise.all(promises)
                    .then(() => )
                    .catch((err) => console.log(err));
                  */
    };

    const uploadImagePicked = (geturls) => {
        const randomid = Math.random().toString(36).substring(7)
        let msg = {
            _id: randomid,
            text: '',
            createdAt: new Date(),
            user: {
                _id: 'Admin',
                name: 'Admin',
                avatar: 'https://static-s.aa-cdn.net/img/gp/20600014266053/JVWGO91AFGOSfDoqO3V_YlUiWnCoiyob0aPkVOss0qASb26aRbXvWiiNK12ZFLxfsSw=s300?v=1'
            },
            image: geturls
        }

        const {
            _id,
            createdAt,
            text,
            user,
            image,
            received
        } = [msg][0]
        db.collection(chatText).add({
            _id,
            createdAt,
            text,
            user,
            image,
            received: false
        })
        insertChatLog(chatText, menuText)

    }


    const handleChangevdo = (e) => {
        setVideos([]);
        setUrls([]);
        for (let i = 0; i < e.target.files.length; i++) {
            const newImage = e.target.files[i];
            newImage["id"] = Math.random();

            setVideos((prevState) => [...prevState, newImage]);
        }
    };

    const handleUploadvdo = async () => {
        const promises = [];
        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        var hours = new Date().getHours(); //Current Hours
        var min = new Date().getMinutes(); //Current Minutes
        var sec = new Date().getSeconds(); //Current Seconds

        const filename = 'admin_' + year + month + date + hours + min + sec

        videos.map((image) => {
            const uploadTask = storage.ref(`videos/${filename}`).put(image);

            promises.push(uploadTask);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setProgress(progress);
                },
                (error) => {
                    console.log(error);
                },
                async () => {
                    await storage
                        .ref("videos")
                        .child(filename)
                        .getDownloadURL()
                        .then((urls) => {
                            uploadVideosPicked(urls)
                            setUrls((prevState) => [...prevState, urls]);
                        });
                }
            );
        });
    };

    const renderMessageVideo = (props) => {
        const { currentMessage } = props;
        return (
            <View style={{ position: 'relative', height: 150, width: 250 }}>
                <Video
                    resizeMode="cover"
                    height={150}
                    width={250}
                    useNativeControls
                    shouldPlay={false}
                    source={{ uri: currentMessage.video }}
                />
            </View>
        );
    };

    const uploadVideosPicked = (geturls) => {
        const randomid = Math.random().toString(36).substring(7)
        let msg = {
            _id: randomid,
            text: '',
            createdAt: new Date(),
            user: {
                _id: 'Admin',
                name: 'Admin',
                avatar: 'https://static-s.aa-cdn.net/img/gp/20600014266053/JVWGO91AFGOSfDoqO3V_YlUiWnCoiyob0aPkVOss0qASb26aRbXvWiiNK12ZFLxfsSw=s300?v=1'
            },
            video: geturls
        }

        const {
            _id,
            createdAt,
            text,
            user,
            video,
            received
        } = [msg][0]
        db.collection(chatText).add({
            _id,
            createdAt,
            text,
            user,
            video,
            received: false
        })
        insertChatLog(chatText, menuText)

    }

    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                tickStyle={{
                    color: props.currentMessage.received ? '#00FF00' : '#454545'
                }}
                timeTextStyle={{
                    right: {
                        color: 'rgb(255,255,255)'
                    },
                    left: {
                        color: 'rgb(0,0,0)'
                    },
                }}
                textStyle={{
                    right: {
                        color: 'rgb(255,255,255)'
                    },
                    left: {
                        color: 'rgb(0,0,0)'
                    },

                }}
                wrapperStyle={{
                    right:
                    {
                        backgroundColor: 'rgba(0,102,204,1)',
                        borderRadius: 15
                    },
                    left:
                    {
                        backgroundColor: 'rgb(255,255,255)',
                        borderRadius: 15
                    }
                }}
                quickReplyStyle={{
                    color: 'rgba(0,102,204,1)',
                    borderWidth: 2,
                    borderRadius: 30,
                    backgroundColor: 'rgb(255,255,255)'
                }}

            />
        );
    };

    const checkShopcode = async () => {
        console.log('checkShopcode shopcode =====', searchByShopCode)

        if (searchByShopCode == '' || searchByShopCode.length != 10) {
            setHideShowChat("hide")
            window.confirm("กรุณากรอกรหัสร้านค้าให้ครบ 10 หลัก");
        } else {
            var Data = {
                shopcode: searchByShopCode,
            };
            try {
                const response = await fetch('https://school.treesbot.com/pepsichat_test/newchat_check_shopcode.php', {
                    method: 'POST',
                    body: JSON.stringify(Data)
                })
                const json = await response.json()
                if (json.status) {
                    console.log('checkShopcode === ', json)
                    selectShopcode(json.displayname, json.displayimage, json.mobileno, json.shopcode, json.shop_name, json.address)
                } else {
                    console.log('checkShopcode === error', json)
                    setHideShowChat("hide")
                    window.confirm("ไม่พบข้อมูลการลงทะเบียนใช้งานแอปเป๊ปซี่แฟนคลับของร้าน " + searchByShopCode + " ไม่สามารถเริ่มการสนทนาได้");
                }


            } catch (error) {
                setHideShowChat("hide")
                console.error(error)
            }
        }

    }

    const selectShopcode = async (displayname, displayimage, mobileno, shopcode, shop_name, address) => {
        var Data = {
            shopcode: shopcode,
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/newchat_select_shopcode.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            if (json[0].Message != 'Not Complete') {
                //open chat
                console.log('selectShopcode === ', json)
                setHideShowChat("show")
                updateChatLog(json[0].Message[0].shopname, json[0].Message[0].shopcode, json[0].Message[0].chatname, json[0].Message[0].menu)
            } else {
                //new chat
                insertShopcode(displayname, displayimage, mobileno, shopcode, shop_name, address)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const insertShopcode = async (displayname, displayimage, mobileno, shopcode, shop_name, address) => {

        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        var hours = new Date().getHours(); //Current Hours
        var min = new Date().getMinutes(); //Current Minutes
        var sec = new Date().getSeconds(); //Current Seconds

        var getchatname = shopcode + '_' + year + month + date + hours + min + sec
        var menu = 'admin'
        var status = 'yes'

        var Data = {
            shopcode: shopcode,
            displayname: displayname,
            displayimage: displayimage,
            shopname: shop_name,
            address: address,
            tell: mobileno,
            chatname: getchatname,
            menu: menu,
            status: status
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/newchat_insert_shop.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            console.log('insert_user === ', json)
            
            if (json[0].Message == 'Complete') {
                setHideShowChat("show")
                updateChatLog(shop_name, shopcode, getchatname, menu)
            } else if (json[0].Message == 'Error'){
                window.confirm( "เริ่มการสนทนาไม่สำเร็จ \n กรุณาลองใหม่อีกครั้ง");
            }else{
                updateChatLog(json[0].Message.shopname, json[0].Message.shopcode, json[0].Message.chatname, json[0].Message.menu)
            }
        } catch (error) {
            console.error(error)
        }
            
    }

    return (
        <View style={[styles.container, {
            flexDirection: "column",
            height: '100%'
        }]}>
            <View style={{
                justifyContent: 'center',
                backgroundColor: 'white',
                height: 60,
                flexDirection: "row",
                marginTop: 0
            }}>
                <TextInput
                    style={styles.input}
                    //    onChangeText={setSearchByShopCode}
                    onChangeText={(text) => setSearchByShopCode(text.toUpperCase())}
                    maxLength={10}
                    value={searchByShopCode}
                    placeholder="กรอกรหัสร้านค้า"
                />
                <View style={styles.styleNewChatBtn}>
                    <Button
                        color="#0a7e07" //button color
                        onPress={() =>
                            checkShopcode()
                        }
                        title="ค้นหา"
                    />
                </View>

            </View >

            {hideShowChat == 'hide' ?
                <View style={{
                    backgroundColor: 'white',
                    flex: 1,
                }} >

                </View>
                :
                <View style={{
                    backgroundColor: 'lightgray',
                    flex: 1,
                    marginTop: 0,
                    marginBottom: 20,
                    marginLeft: 100,
                    marginRight: 100,
                    borderWidth: 2,
                    borderRadius: 10,
                    borderColor: '#0089FC',

                }} >
                    <View
                        style={{
                            flexDirection: "row",
                            height: 40,
                            paddingLeft: 20,
                            paddingRight: 20,
                            paddingTop: 0,
                            paddingBottom: 0,
                            borderWidth: 2,
                            borderRadius: 5,
                            borderColor: '#0089FC',
                            backgroundColor: '#0089FC',
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.titleText}>{titleText}</Text>
                        </View>
                    </View>

                    <GiftedChat
                        messages={messages}
                        showAvatarForEveryMessage={true}
                        renderBubble={renderBubble}
                        renderMessageVideo={renderMessageVideo}
                        onSend={messages => onSend(messages, chatText, menuChat)}
                        user={{
                            _id: 'Admin',
                            name: 'Admin',
                            avatar: 'https://static-s.aa-cdn.net/img/gp/20600014266053/JVWGO91AFGOSfDoqO3V_YlUiWnCoiyob0aPkVOss0qASb26aRbXvWiiNK12ZFLxfsSw=s300?v=1'
                        }}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            height: 30,
                            marginBottom: 0,
                        }}
                    >
                        <View style={{ backgroundColor: "#AED6F1", flex: 2 }}>
                            <div>
                                <input type="file" id="upload-file" onChange={handleChange} accept="image/*" />
                            </div>
                        </View>
                        <View style={styles.styleSendImageBtn}>
                            <Button
                                color="#2E86C1" //button color
                                onPress={() => handleUpload()}
                                title="ส่งรูป"
                            />
                        </View>
                        <View style={{ backgroundColor: "#AED6F1", flex: 2 }}>
                            <div>
                                <input type="file" id="upload-file-video" onChange={handleChangevdo} accept="video/*" />
                            </div>

                        </View>
                        <View style={styles.styleSendImageBtn}>
                            <Button
                                color="#2E86C1" //button color
                                onPress={() => handleUploadvdo()}
                                title="ส่งวิดีโอ"
                            />
                        </View>
                    </View>
                </View>
            }
        </View>

    )
}
export default NewChatScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        width: 200,
        marginLeft: 40,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'darkgray',
        padding: 10
    },
    styleNewChatBtn: {
        width: 80,
        height: 39,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "#056f00", //button background/border color
        overflow: "hidden",
    },
    Img: {
        height: 50,
        width: 50,
        borderRadius: 25
    },
    namechats: {
        /// flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0089FC',
        height: 40
    },
    titleText: {
        textAlign: 'center',
        backgroundColor: '#0089FC',
        fontSize: 20,
        padding: 5,
        color: '#fff',
        height: 40

    },
    notiText: {
        textAlign: 'center',
        backgroundColor: 'red',
        fontSize: 10,
        padding: 5,
        marginTop: 5,
        marginRight: 5,
        color: '#fff',
        height: 20,
        width: 20,
        borderRadius: 10
    },
    sectionListItemStyle: {
        fontSize: 15,
        paddingTop: 15,
        paddingRight: 15,
        paddingLeft: 15,
        color: '#000',
        backgroundColor: 'white',
    },
    sectionListItemStyle2: {
        fontSize: 8,
        color: 'gray',
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: 'white',
    },
    listItemSeparatorStyle: {
        height: 0.5,
        width: '100%',
        backgroundColor: '#C8C8C8',
    },
    buttonNewChat: {
        justifyContent: 'center',
        width: 250,
        height: 40,
        borderRadius: 10
    },
    button: {
        justifyContent: 'center',
        width: 250,
        height: 40,
        borderRadius: 10
    },
    buttonchat: {
        justifyContent: 'center',
        width: 250,
        height: 40,
        borderRadius: 10
    },
    scroll: {
        flex: 1,
        marginHorizontal: 16
    },
    styleSendImageBtn: {
        flex: 0.5,
        backgroundColor: "#2E86C1",
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        overflow: "hidden",
        marginBottom: 0,
    },
});