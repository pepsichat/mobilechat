import React, { useEffect, useState } from 'react'
import { SectionList, StyleSheet, Text, View, Image, Alert, Modal, Pressable } from 'react-native';
import { db } from '../firebase';
import { GiftedChat } from 'react-native-gifted-chat';
import { FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { DataTable, IconButton } from 'react-native-paper';
import { Video, Audio } from 'expo-av';

import axios from 'axios'
import { ExportToExcel } from './ExportToExcel'

const HistoryScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [messages, setMessages] = useState([]);

    const [titleText, setTitleText] = useState("")
    const [shopDisplayImage, setShopDisplayImage] = useState("")
    const [shopCodeText, setShopCodeText] = useState("")
    const [shopNameText, setShopNameText] = useState("")
    const [shopTellText, setShopTellText] = useState("")
    const [shopAddressText, setShopAddressText] = useState("")
    const [shopChatNameText, setShopChatNameText] = useState("")
    const [shopMenu, setShopMenu] = useState("")

    var chatName = ''

    const [search, setSearch] = useState('');
    const [filteredDataSource1, setFilteredDataSource1] = useState([]);
    const [masterDataSource1, setMasterDataSource1] = useState([]);
    const [filteredDataSource2, setFilteredDataSource2] = useState([]);
    const [masterDataSource2, setMasterDataSource2] = useState([]);
    const [filteredDataSource3, setFilteredDataSource3] = useState([]);
    const [masterDataSource3, setMasterDataSource3] = useState([]);
    const [filteredDataSource4, setFilteredDataSource4] = useState([]);
    const [masterDataSource4, setMasterDataSource4] = useState([]);
    const [filteredDataSource5, setFilteredDataSource5] = useState([]);
    const [masterDataSource5, setMasterDataSource5] = useState([]);

    const [filteredDataSource6, setFilteredDataSource6] = useState([]);
    const [masterDataSource6, setMasterDataSource6] = useState([]);

    const [data, setData] = useState([]);
    const fileName = "Export_Chat_Report"; // here enter filename for your excel file




    const getUser = async (menu) => {
        var Data = {
            menu: menu,
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat/select_user_menu.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            if (menu == 'group1') {
                setFilteredDataSource1(json);
                setMasterDataSource1(json);
                onPressTitle(json[0].displayimage, json[0].shopname, json[0].shopcode, json[0].tell, json[0].address, json[0].chatname, json[0].menu)
                getTable(json[0].shopcode)
            } else if (menu == 'group2') {
                setFilteredDataSource2(json);
                setMasterDataSource2(json);
            } else if (menu == 'group3') {
                setFilteredDataSource3(json);
                setMasterDataSource3(json);
            } else if (menu == 'group4') {
                setFilteredDataSource4(json);
                setMasterDataSource4(json);
            } else if (menu == 'group5') {
                setFilteredDataSource5(json);
                setMasterDataSource5(json);
            } else if (menu == '') {
                setFilteredDataSource6(json);
                setMasterDataSource6(json);
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getUser('group1')
        getUser('group2')
        getUser('group3')
        getUser('group4')
        getUser('group5')
        getUser('')

        const fetchData = () => {
            axios.get('https://school.treesbot.com/pepsichat/export_chat_all.php').then(r => setData(r.data))
        }
        fetchData()
    }, [])

    const searchFilterFunction = (text) => {
        // Check if searched text is not blank
        if (text) {
            // Inserted text is not blank
            // Filter the masterDataSource
            // Update FilteredDataSource
            const newData1 = masterDataSource1.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            const newData2 = masterDataSource2.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            const newData3 = masterDataSource3.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            const newData4 = masterDataSource4.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            const newData5 = masterDataSource5.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            const newData6 = masterDataSource6.filter(function (item) {
                const itemData = item.shopcode
                    ? item.shopcode.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            setFilteredDataSource1(newData1);
            setFilteredDataSource2(newData2);
            setFilteredDataSource3(newData3);
            setFilteredDataSource4(newData4);
            setFilteredDataSource5(newData5);
            setFilteredDataSource6(newData6)

            setSearch(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setFilteredDataSource1(masterDataSource1);
            setFilteredDataSource2(masterDataSource2);
            setFilteredDataSource3(masterDataSource3);
            setFilteredDataSource4(masterDataSource4);
            setFilteredDataSource5(masterDataSource5);
            setFilteredDataSource6(masterDataSource6)

            setSearch(text);
        }
    };

    const onPressChat = (chatname) => {
        chatName = chatname
        setModalVisible(true)
        readUser()
    };

    async function readUser() {
        const unsubscribe = db.collection(chatName).orderBy('createdAt', 'desc').onSnapshot(snapshot => setMessages(
            snapshot.docs.map(doc => ({
                _id: doc.data()._id,
                createdAt: doc.data().createdAt.toDate(),
                text: doc.data().text,
                user: doc.data().user,
                image: doc.data().image,
                video: doc.data().video

            }))
        ))
        return () => unsubscribe;
    }

    const FlatListItemSeparator = () => {
        return (
            //Item Separator
            <View style={styles.listItemSeparatorStyle} />
        );
    };

    const onPressTitle = (displayimage, username, shopcode, tell, address, chatname, menu) => {
        chatName = chatname
        let getTitle = shopcode + ' (' + username + ')'

        setTitleText(getTitle);
        setShopDisplayImage(displayimage)
        setShopNameText(username);
        setShopCodeText(shopcode);
        setShopTellText(tell);
        setShopAddressText(address);
        setShopChatNameText(chatname);
        setShopMenu(menu);

        getTable(shopcode);
    };

    const [dataTable, setDataTable] = useState([]);

    const getTable = async (shopcode) => {
        var Data = {
            shopcode: shopcode,
        };
        try {
            const response = await fetch('https://school.treesbot.com/pepsichat/select_user_shopcode.php', {
                method: 'POST',
                body: JSON.stringify(Data)
            })
            const json = await response.json()
            setDataTable(json);
        } catch (error) {
            console.error(error)
        }
    }

    const test2 = (menu) => {
        var groupname = ''
        if (menu == 'group1') {
            groupname = 'แจ้งปัญหาจากกิจกรรมถ่ายรูปตู้แช่'
        } else if (menu == 'group2') {
            groupname = 'สอบถาม, ติดตาม หรือแจ้งปัญหาการแลกของรางวัล'
        } else if (menu == 'group3') {
            groupname = 'สอบถามหรือแจ้งปัญหาการใช้งานแอพพลิเคชั่นด้านอื่นๆ'
        } else if (menu == 'group4') {
            groupname = 'สอบถามรายละเอียดทั่วไป'
        } else if (menu == 'group5') {
            groupname = 'แอด LINE เป๊ปซี่แฟนคลับ'
        } else if (menu == '') {
            groupname = 'ไม่ได้เลือกหัวข้อสนทนา'
        }
        return groupname
    }
    const _renderItem = ({ item }) => (
        <DataTable.Row>
            <DataTable.Cell style={{ flex: 1 }}>{item.num}</DataTable.Cell>
            <DataTable.Cell style={{ flex: 2 }}>{item.dateinsert}</DataTable.Cell>
            <DataTable.Cell style={{ flex: 3 }}>{test2(item.menu)}</DataTable.Cell>
            <DataTable.Cell style={{ flex: 1 }}><IconButton
                icon="eye"
                color={'blue'}
                size={20}
                onPress={() => onPressChat(item.chatname)}
            />
            </DataTable.Cell>

        </DataTable.Row>
    );

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
                    style={styles.video}
                />
            </View>
        );
    };

    return (

        <View style={[styles.container, {
            // Try setting `flexDirection` to `"row"`.
            flexDirection: "row"
        }]}>
            <View style={{ flex: 1, backgroundColor: "white" }}>
                <ExportToExcel apiData={data} fileName={fileName} />
                <SearchBar
                    lightTheme
                    round
                    searchIcon={{ size: 24 }}
                    onChangeText={(text) => searchFilterFunction(text)}
                    onClear={(text) => searchFilterFunction('')}
                    placeholder="ค้นหาจากรหัสร้านค้า..."
                    value={search}
                />

                <SectionList
                    style={{ height: 100 }}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    sections={[
                        { title: 'แจ้งปัญหาจากกิจกรรมถ่ายรูปตู้แช่', data: filteredDataSource1 },
                        { title: 'สอบถาม, ติดตาม หรือแจ้งปัญหาการแลกของรางวัล', data: filteredDataSource2 },
                        { title: 'สอบถามหรือแจ้งปัญหาการใช้งานแอพพลิเคชั่นด้านอื่นๆ', data: filteredDataSource3 },
                        { title: 'สอบถามรายละเอียดทั่วไป', data: filteredDataSource4 },
                        { title: 'แอด LINE เป๊ปซี่แฟนคลับ', data: filteredDataSource5 },
                        { title: 'ไม่ได้เลือกหัวข้อสนทนา', data: filteredDataSource6 },

                    ]}
                    renderSectionHeader={({ section }) => (
                        <Text style={styles.groupText}> {section.title} </Text>
                    )}
                    renderItem={({ item }) => (
                        // Single Comes here which will be repeatative for the FlatListItems
                        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 20 }}>
                            <Image
                                source={{ uri: item.displayimage }}
                                style={styles.Img}
                            />
                            <Text
                                style={styles.sectionListItemStyle}
                                //Item Separator View
                                onPress={() => onPressTitle(item.displayimage, item.shopname, item.shopcode, item.tell, item.address, item.chatname, item.menu)}>

                                {item.shopcode} ({item.shopname})
                            </Text>

                        </View>
                    )}
                    keyExtractor={(item, index) => index}
                />
            </View>
            <View style={{ flex: 2, backgroundColor: "#0089FC" }} >
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <GiftedChat
                                messages={messages}
                                showAvatarForEveryMessage={true}
                                renderMessageVideo={renderMessageVideo}
                                user={{
                                    _id: 'Admin',
                                    name: 'Admin',
                                    avatar: 'https://static-s.aa-cdn.net/img/gp/20600014266053/JVWGO91AFGOSfDoqO3V_YlUiWnCoiyob0aPkVOss0qASb26aRbXvWiiNK12ZFLxfsSw=s300?v=1'
                                }}
                                renderInputToolbar={() => { return null }}
                            />
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text style={styles.textStyle}>ปิด</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
                <View
                    style={{
                        backgroundColor: "white",
                        flexDirection: "row",
                        height: 150,
                        padding: 0,
                        borderRadius: 20,
                        marginTop: 20,
                        marginLeft: 20,
                        marginRight: 20
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Image
                            source={{ uri: shopDisplayImage }}
                            style={styles.Img2}
                        />
                    </View>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.titleText}><b>{titleText}</b></Text>
                        <Text style={styles.titleText}>รหัสร้านค้า : {shopCodeText}</Text>
                        <Text style={styles.titleText}>เบอร์โทรติดต่อ : {shopTellText}</Text>
                        <Text style={styles.titleText}>ที่อยู่ : {shopAddressText}</Text>
                    </View>
                </View>
                <View style={{
                    backgroundColor: "white",
                    flexDirection: "row",
                    borderRadius: 20,
                    marginTop: 10,
                    marginLeft: 20,
                    marginRight: 20,
                    marginBottom: 10
                }}>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={{ flex: 1 }}>No</DataTable.Title>
                            <DataTable.Title style={{ flex: 2 }}>Date</DataTable.Title>
                            <DataTable.Title style={{ flex: 3 }}>Message</DataTable.Title>
                            <DataTable.Title style={{ flex: 1 }}>Action</DataTable.Title>

                        </DataTable.Header>

                        <FlatList data={dataTable} renderItem={_renderItem} />
                    </DataTable>
                </View>
            </View>
        </View >

    )
}
export default HistoryScreen

const styles = StyleSheet.create({
    Img: {
        height: 50,
        width: 50,
        borderRadius: 25
    },
    Img2: {
        marginTop: 25,
        marginLeft: 50,
        height: 100,
        width: 100,
        borderRadius: 75
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
    container2: {
        /// flex: 1,
        // justifyContent: 'center',
        backgroundColor: 'white',
        height: 400,
        width: 600
    },
    groupText: {
        backgroundColor: 'gray',
        fontSize: 18,
        padding: 5,
        color: 'white',
    },
    titleText: {
        fontSize: 16,
        padding: 5,
        color: 'black',
    },
    sectionListItemStyle: {
        fontSize: 15,
        padding: 15,
        color: '#000',
        backgroundColor: 'white',
    },
    listItemSeparatorStyle: {
        height: 0.5,
        width: '100%',
        backgroundColor: '#C8C8C8',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        flex: 1,
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        width: 500,
        height: 500,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});