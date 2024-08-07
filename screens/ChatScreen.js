import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView, ScrollView, SectionList, StyleSheet, Text, View, Image, Button } from 'react-native';
import { db, storage } from '../firebase';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { SearchBar } from 'react-native-elements';
import { Video, Audio } from 'expo-av';
import { hydrate } from 'react-native-web/dist/cjs/exports/render';

const ChatScreen = ({ navigation }) => {
    const unsubFromMessagesRef = React.useRef();

    const [messages, setMessages] = useState([]);
    const [titleText, setTitleText] = useState("");
    const [shopCodeText, setShopCodeText] = useState("");
    const [shopNameText, setShopNameText] = useState("");
    const [chatText, setChatText] = useState("");
    const [menuText, setMenuText] = useState("");

    const [count, setCount] = useState(3);
    const [searchchat, setSearchchat] = useState('unread');


    var shopCode = ''
    var chatName = ''
    var menuChat = ''

    const [search, setSearch] = useState('');
    const [filteredDataSource, setFilteredDataSource] = useState([]);
    const [masterDataSource, setMasterDataSource] = useState([]);

    const getUser = async () => {
        setFilteredDataSource([])
        setMasterDataSource([])
        var Data = {
            searchchat: searchchat,
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/select_user_and_log_limit.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            if (json[0].Message != 'Not Complete') {
                setFilteredDataSource(json[0].Message);
                setMasterDataSource(json[0].Message);
                onPressTitle(json[0].Message[0].shopname, json[0].Message[0].shopcode, json[0].Message[0].chatname, json[0].Message[0].menu)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
            setCount(0)
            // Inserted text is not blank
            // Filter the masterDataSource
            // Update FilteredDataSource
            const newData = masterDataSource.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            setFilteredDataSource(newData);
            setSearch(text);
        } else {
            setCount(3)
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setFilteredDataSource(masterDataSource);
            setSearch(text);
        }
    };

    const updateChat = async (getchatText) => {
        var Data = {
            chatname: getchatText,
            status: 'no'
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/close_chat.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            if (json[0].Message == 'Complete') {
                getUser()
            }
            // alert(json[0].Message)
        } catch (error) {
            alert(error)
            console.error(error)
        }
    }

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

    useEffect(() => {
        // selectChatLog()
        const countTimer = setInterval(() => {
            manageTimer();
        }, 1000);
        // and clear this timer when the component is unmounted
        return function cleanup() {
            clearInterval(countTimer);
        };
    });

    const manageTimer = async () => {

        if (count == 0) {

        } else if (count == 1) {
            selectChatLog()
        } else {
            setCount(count - 1)
        }
    }

    const selectChatLog = async () => {
        var Data = {
            searchchat: searchchat,
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/select_user_and_log_limit.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            //  console.log('selectChatLog=== ', json[0].Message[0].shopname)
            if (json[0].Message != 'Not Complete') {
                setFilteredDataSource(json[0].Message);
                setMasterDataSource(json[0].Message);
                selectChatLogL()
            } else {
                setFilteredDataSource([]);
                setMasterDataSource([]);
            }

        } catch (error) {
            console.error(error)
            setCount(3)
        }
    }

    const selectChatLogNew = async (searchchatlog) => {
        var Data = {
            searchchat: searchchatlog,
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/select_user_and_log_limit.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            if (json[0].Message != 'Not Complete') {
                setFilteredDataSource(json[0].Message);
                setMasterDataSource(json[0].Message);
                selectChatLogL()
            } else {
                setFilteredDataSource([]);
                setMasterDataSource([]);
            }

        } catch (error) {
            console.error(error)
            setCount(3)
        }
    }

    const selectChatLogL = async () => {
        var Data = {
            shopcode: shopCodeText,
            chatname: chatText,
            status: 'read'
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat_test/update_chat_log_web.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            const cityRef = db.collection(chatText).where("user._id", "==", shopCodeText)
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.update({ received: true })
                    });
                })

            setCount(3)
        } catch (error) {
            setCount(3)
            console.error(error)
        }
    }

    const submit = async (getchatText) => {
        const res = window.confirm("ยืนยันปิดการสนทนา " + titleText);

        if (res) {
            // show your message success
            updateChat(getchatText)
        }
    }

    const submitsearch = async (getsearchchat) => {
        setCount(0)
        setSearchchat(getsearchchat)
        selectChatLogNew(getsearchchat)
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
        // alert(shopcode + " " + chatname)
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

    const FlatListItemSeparator = () => {
        return (
            //Item Separator
            <View style={styles.listItemSeparatorStyle} />
        );
    };
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const [urls, setUrls] = useState([]);
    const [progress, setProgress] = useState(0);

    const handleChange = (e) => {
        setImages([]);
        setUrls([]);
        console.log('handleChange1 ==== ', e.target.files.length)
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
            //  uploadImagePicked()
        });

        /*
                Promise.all(promises)
                    .then(() => )
                    .catch((err) => console.log(err));
                  */
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

    return (

        <View style={[styles.container, {
            flexDirection: "row"
        }]}>
            <View style={{ flex: 1, backgroundColor: "write" }}>
                <View style={styles.styleNewChatBtn}>
                    <Button
                        color="#0a7e07" //button color
                        onPress={() => navigation.navigate('LiveChat')}
                        title="เริ่มการสนทนาใหม่"
                    />
                </View>

                <SearchBar
                    lightTheme
                    round
                    searchIcon={{ size: 24 }}
                    onChangeText={(text) => searchFilterFunction(text)}
                    onClear={(text) => searchFilterFunction('')}
                    placeholder="ค้นหาจากรหัสร้านค้า..."
                    value={search}
                />
                <View
                    style={{
                        flexDirection: "row",
                        padding: 10,
                        gap: 5
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Button title="ยังไม่ได้อ่าน" style={styles.button}
                            color={"#FF0000"}
                            onPress={() =>
                                submitsearch("unread")
                            }
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button title="อ่านแล้ว" style={styles.button}
                            color={"#006400"}
                            onPress={() =>
                                submitsearch("read")
                            }
                        />
                    </View>
                </View>

                <SectionList
                    style={{ height: 100 }}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    sections={[
                        { data: filteredDataSource },
                    ]}
                    renderItem={({ item }) => (
                        // Single Comes here which will be repeatative for the FlatListItems
                        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 20 }}>
                            <Image
                                source={{ uri: item.displayimage }}
                                style={styles.Img}
                            />
                            <View style={{ flexDirection: 'column' }}>
                                <Text
                                    style={styles.sectionListItemStyle}
                                    //Item Separator View
                                    onPress={() => updateChatLog(item.shopname, item.shopcode, item.chatname, item.menu)}>

                                    {item.shopcode} ({item.shopname})
                                </Text>
                                <Text style={styles.sectionListItemStyle2}>
                                    {item.lasttime}
                                </Text>
                            </View>

                            <Text
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: item.chatcolor,
                                    fontSize: 10,
                                    padding: 5,
                                    marginTop: 5,
                                    color: '#fff',
                                    height: 20,
                                    width: 20,
                                    borderRadius: 10
                                }}>
                                {item.chatcount}
                            </Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => index}
                />
            </View>
            <View style={{ flex: 2, backgroundColor: "lightgray" }} >
                <View
                    style={{
                        flexDirection: "row",
                        height: 30,
                        padding: 0
                    }}
                >
                    <View style={{ backgroundColor: "#0089FC", flex: 3 }}>
                        <Text style={styles.titleText}>{titleText}</Text>
                    </View>
                    <View style={{ backgroundColor: "#0089FC", flex: 0.5 }}>
                        <Button title="ปิดการสนทนา" style={styles.button}
                            color={"blue"}
                            onPress={() => submit(chatText)}
                        />
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
                        padding: 0
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
                    <View style={{ backgroundColor: "#A9CCE3", flex: 2 }}>
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
        </View >
    )
}
export default ChatScreen

const styles = StyleSheet.create({
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
    container: {

        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
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
    styleNewChatBtn: {
        marginTop: 10,
        marginLeft: 60,
        marginRight: 60,
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "#056f00", //button background/border color
        overflow: "hidden",
        marginBottom: 10,
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