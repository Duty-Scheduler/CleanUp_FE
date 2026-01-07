import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (hour: number, minute: number) => void;
    initialHour?: number;
    initialMinute?: number;
    label?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

export default function TimePicker({
    visible,
    onClose,
    onConfirm,
    initialHour = 0,
    initialMinute = 0,
    label = 'Select Time',
}: TimePickerProps) {
    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);

    // Reset state when opened
    React.useEffect(() => {
        if (visible) {
            setSelectedHour(initialHour);
            setSelectedMinute(initialMinute);
        }
    }, [visible, initialHour, initialMinute]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.pickerRow}>
                        {/* Hour Picker */}
                        <ScrollView style={styles.picker} contentContainerStyle={styles.pickerContent} showsVerticalScrollIndicator={false}>
                            {hours.map((h) => (
                                <TouchableOpacity key={h} style={[styles.item, selectedHour === h && styles.selectedItem]} onPress={() => setSelectedHour(h)}>
                                    <Text style={[styles.itemText, selectedHour === h && styles.selectedText]}>{h.toString().padStart(2, '0')}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Text style={styles.colon}>:</Text>
                        {/* Minute Picker */}
                        <ScrollView style={styles.picker} contentContainerStyle={styles.pickerContent} showsVerticalScrollIndicator={false}>
                            {minutes.map((m) => (
                                <TouchableOpacity key={m} style={[styles.item, selectedMinute === m && styles.selectedItem]} onPress={() => setSelectedMinute(m)}>
                                    <Text style={[styles.itemText, selectedMinute === m && styles.selectedText]}>{m.toString().padStart(2, '0')}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.actionText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okBtn} onPress={() => onConfirm(selectedHour, selectedMinute)}>
                            <Text style={styles.actionText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: 320,
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    picker: {
        height: 160,
        width: 60,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    pickerContent: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    item: {
        paddingVertical: 10,
        alignItems: 'center',
        width: '100%',
        borderRadius: 6,
    },
    selectedItem: {
        backgroundColor: '#2196F3',
    },
    itemText: {
        fontSize: 20,
        color: '#333',
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    colon: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginRight: 8,
    },
    okBtn: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2196F3',
        marginLeft: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});
