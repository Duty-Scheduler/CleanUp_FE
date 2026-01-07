import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Member {
    id: string;
    name: string;
}

interface MemberPickerProps {
    visible: boolean;
    members: Member[];
    selected: string[];
    onClose: () => void;
    onConfirm: (selectedIds: string[]) => void;
}

export default function MemberPicker({ visible, members, selected, onClose, onConfirm }: MemberPickerProps) {
    const [checked, setChecked] = useState<string[]>(selected);

    useEffect(() => {
        if (visible) setChecked(selected);
    }, [visible, selected]);

    const toggle = (id: string) => {
        setChecked((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Select Member</Text>
                    <ScrollView style={styles.list}>
                        {members.map((m) => (
                            <TouchableOpacity key={m.id} style={styles.item} onPress={() => toggle(m.id)}>
                                <View style={[styles.checkbox, checked.includes(m.id) && styles.checkedBox]} />
                                <Text style={styles.name}>{m.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.actionText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okBtn} onPress={() => onConfirm(checked)}>
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
        maxHeight: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    list: {
        width: '100%',
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#2196F3',
        marginRight: 12,
        backgroundColor: '#fff',
    },
    checkedBox: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    name: {
        fontSize: 16,
        color: '#333',
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
