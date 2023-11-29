import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import IClient from './interfaces/client';
import INote from './interfaces/note';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [notes, setNotes] = useState<INote[]>([]); 
  const [title, setTitle] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [client, setClient] = useState({}); 
  const [category, setCategory] = useState({}); 
  const [clients, setClients] = useState<IClient[]>(require('./data/clients.json')); 
  const [categories, setCategories] = useState(require('./data/categories.json')); 
  const [selectedNote, setSelectedNote] = useState<INote>(null);  
  const [modalVisible, setModalVisible] = useState(false); 

  const storeData = async () => {
    try {
      const jsonValue = JSON.stringify(notes);
      await AsyncStorage.setItem('notes', jsonValue);
    } catch (e) {
      // saving error
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('notes');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      // error reading value
    }
    return []
  }

  useEffect(() => {
    const firstLoad = async () => {
      try {
        setNotes(await getData());
      } catch (err) {
        console.log(err);
      }
      };
      firstLoad();
  }, []);

  const handleEditNote = (note: INote) => { 
    setSelectedNote(note); 
    setTitle(note.title); 
    setMessage(note.message); 
    setClient(note.client); 
    setCategory(note.category); 
    setModalVisible(true); 
  }; 

  const handleDelete = () => { 
    const tempNotes = notes.filter((note) => 
        note.id !== selectedNote.id
    ); 
    setNotes(tempNotes);
    handleClose()
  }; 

  const handleClose = () => { 
    setSelectedNote(null); 
    setTitle(""); 
    setMessage(""); 
    setClient(null); 
    setCategory(null); 
    setModalVisible(false); 
  }; 

  const handleSave = () => { 
    const tempNotes = notes.filter((note) => 
        note?.id !== selectedNote?.id
    ); 
    const newNote = { 
      id: Date.now(), 
      title, 
      category,
      client,
      message, 
    }; 
    tempNotes.push(newNote)
    setNotes(tempNotes);
    setTitle(""); 
    setMessage(""); 
    setClient(null); 
    setCategory(null); 
    setModalVisible(false); 
  };

  useEffect(()=>{
    storeData()
  }, [notes])


  return (
    <View style={styles.container}> 
      <Pressable style={styles.addButton}
        onPress={() => 
            setModalVisible(true) 
        } 
      >
        <Text style={styles.addButtonText}>
          New Note
        </Text>
      </Pressable>
      <ScrollView style={{width:'100%', padding:6}}>
        <Text style={{margin:10}}>
          All your notes:
        </Text>
        {notes.map((note) => ( 
          <Pressable 
              style={{backgroundColor: '#E0E0E0', margin:6  }}
              key={note.id} 
              onPress={() => handleEditNote(note)} 
          >
            <Text style={{color: "#333", margin:6}}>
              {note.title}
            </Text>
          </Pressable>

        ))} 
        {
          notes.length == 0 && <Text style={{margin:6}}>
            No notes, try adding a new one!
          </Text>
        }
      </ScrollView>
      <Modal 
        visible={modalVisible} 
        animationType="slide"
        transparent={false} 
      > 
        <View style={styles.modalContainer}> 
          {/* Note Category input */} 
          <SelectDropdown
            data={categories}
            defaultButtonText={'Select category'}
            buttonStyle={styles.dropdownBtnStyle}
            buttonTextStyle={styles.dropdownBtnTxtStyle}
            renderDropdownIcon={isOpened => {
              return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#E0E0E0'} size={18} />;
            }}
            defaultValue={category}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdownDropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTxtStyle}
            onSelect={(selectedItem, index) => {
              setCategory(selectedItem)
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name;
            }}
            rowTextForSelection={(item, index) => {
              return item.name;
            }}
          />

          {/* Note client input */} 
          <SelectDropdown
            data={clients}
            defaultValue={client}
            defaultButtonText={'Select client'}
            buttonStyle={styles.dropdownBtnStyle}
            buttonTextStyle={styles.dropdownBtnTxtStyle}
            renderDropdownIcon={isOpened => {
              return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#E0E0E0'} size={18} />;
            }}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdownDropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTxtStyle}
            onSelect={(selectedItem, index) => {
              setClient(selectedItem)
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return `${selectedItem.first_name} ${selectedItem.last_name}` ;
            }}
            rowTextForSelection={(item, index) => {
              return `${item.first_name} ${item.last_name}` ;
            }}
          />
          {/* Note title input */} 
          <TextInput 
              style={styles.input} 
              placeholder="Enter a title"
              value={title} 
              onChangeText={setTitle} 
          /> 

          {/* Note content input */} 
          <TextInput 
              style={styles.contentInput} 
              multiline 
              placeholder="Enter the message"
              value={message} 
              onChangeText={setMessage} 
          /> 

          {/* Buttons for saving, canceling, and deleting */} 
          <View style={styles.buttonContainer}> 
            <Button 
                title="Close"
                onPress={() => 
                  {
                    handleClose()
                  }
                } 
                color="#FF3B30"
            /> 
            <Button 
                title="save"
                onPress={() => 
                  handleSave()
                } 
                color="#FF3B30"
            /> 
            {selectedNote && ( 
              <Button 
                  title="Delete"
                  onPress={() => 
                      handleDelete() 
                  } 
                  color="#FF9500"
              /> 
            )} 
          </View> 
        </View> 
      </Modal> 
    </View> 
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#333", 
  }, 
  noteList: { 
      flex: 1, 
  }, 
  noteTitle: { 
      fontSize: 15, 
      marginBottom: 10, 
      fontWeight: "bold", 
      color: "black", 
      backgroundColor: "white", 
      height: 40, 
      width: "100%", 
      padding: 10, 
      borderRadius: 8, 
  }, 
  addButton: { 
    width: 'auto',  
    height: 'auto',   
    borderRadius: 6,            
    backgroundColor: '#ee6e73',   
  }, 
  addButtonText: { 
    color: "white", 
    fontSize: 20, 
    fontWeight: "bold", 
    top: 'auto', 
    margin: 8
  }, 
  modalContainer: { 
      flex: 1, 
      padding: 50, 
      backgroundColor: "white", 
  }, 
  input: { 
      borderWidth: 1, 
      borderColor: "#E0E0E0", 
      padding: 10, 
      marginBottom: 10, 
      borderRadius: 5, 
  }, 
  contentInput: { 
      borderWidth: 1, 
      borderColor: "#E0E0E0", 
      padding: 10, 
      marginBottom: 20, 
      borderRadius: 5, 
      height: 150, 
      textAlignVertical: "top", 
  }, 
  buttonContainer: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
  }, 
  dropdownBtnStyle: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom:6
  },
  dropdownBtnTxtStyle: {
    color: '#333', 
    textAlign: 'left'
  },
  dropdownDropdownStyle: {
    backgroundColor: '#EFEFEF'
  },
  dropdownRowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5'
  },
  dropdownRowTxtStyle: {
    color: '#444', 
    textAlign: 'left'
  },
});
