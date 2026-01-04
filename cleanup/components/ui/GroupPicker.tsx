import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MemberPicker, { Member } from './MemberPicker';

export interface Group {
    id: string;
    name: string;
    members: Member[];
}

interface GroupPickerProps {
    visible: boolean;
    groups: Group[];
    pageSize?: number;
    onClose: () => void;
    onConfirm: (group: Group, members: Member[]) => void;
}

export default function GroupPicker({ visible, groups, pageSize = 5, onClose, onConfirm }: GroupPickerProps) {
    const [page, setPage] = useState(0);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const pagedGroups = groups.slice(page * pageSize, (page + 1) * pageSize);

    const handleSelectGroup = (group: Group) => {
        setSelectedGroup(group);
        setSelectedMembers([]); // Xóa người cũ khi chọn nhóm mới
    };

    const handleConfirmMembers = (ids: string[]) => {
        setSelectedMembers(ids);
        if (selectedGroup) {
            const members = selectedGroup.members.filter(m => ids.includes(m.id));
            onConfirm(selectedGroup, members);
            setSelectedGroup(null);
            setSelectedMembers([]);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Select Group</Text>
                    <FlatList
                        data={pagedGroups}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.groupItem} onPress={() => handleSelectGroup(item)}>
                                <Text style={styles.groupName}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.list}
                    />
                    <View style={styles.pagination}>
                        <TouchableOpacity disabled={page === 0} onPress={() => setPage(page - 1)} style={[styles.pageBtn, page === 0 && styles.disabledBtn]}>
                            <Text style={styles.pageText}>{'<'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.pageText}>{page + 1} / {Math.ceil(groups.length / pageSize)}</Text>
                        <TouchableOpacity disabled={(page + 1) * pageSize >= groups.length} onPress={() => setPage(page + 1)} style={[styles.pageBtn, (page + 1) * pageSize >= groups.length && styles.disabledBtn]}>
                            <Text style={styles.pageText}>{'>'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.actionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* MemberPicker modal */}
                {selectedGroup && (
                    <MemberPicker
                        visible={true}
                        members={selectedGroup.members}
                        selected={selectedMembers}
                        onClose={() => setSelectedGroup(null)}
                        onConfirm={handleConfirmMembers}
                    />
                )}
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    list: {
        width: '100%',
        marginBottom: 16,
        maxHeight: 200,
    },
    groupItem: {
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    groupName: {
        fontSize: 16,
        color: '#333',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    pageBtn: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#eee',
        marginHorizontal: 8,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    pageText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});
