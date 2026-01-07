import { DateItem } from '@/data/dateTypes';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DateRowProps {
    dates: DateItem[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    monthList: number[];
    yearList: number[];
}

const getMonthYear = (item: DateItem, month: number, year: number) => {
    if (item.day === 'Other') return '';
    return `${(month + 1).toString().padStart(2, '0')}/${year}`;
};

export default function DateRow({ dates, selectedIndex, onSelect, monthList, yearList }: DateRowProps) {
    return (
        <View style={styles.dateRow}>
            {dates.map((item, index: number) => {
                const active = index === selectedIndex;
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dateCard, active && styles.dateCardActive]}
                        onPress={() => onSelect(index)}
                        activeOpacity={0.8}
                    >
                        {item.day !== 'Other' && (
                            <Text style={[styles.monthYear, active && styles.dateTextActive]}>{getMonthYear(item, monthList[index], yearList[index])}</Text>
                        )}
                        <Text style={[styles.dateNumber, active && styles.dateTextActive]}>{item.day}</Text>
                        <Text style={[styles.dateLabel, active && styles.dateTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: '100%',
        maxWidth: 360,
        paddingHorizontal: 20,
        gap: 16,
    },
    dateCard: {
        width: 80,
        height: 110,
        borderRadius: 20,
        backgroundColor: '#F3F6F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
        paddingTop: 8,
    },
    monthYear: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    dateCardActive: { backgroundColor: '#1677FF' },
    dateNumber: { fontSize: 24, fontWeight: '700', color: '#333' },
    dateLabel: { fontSize: 18, color: '#777' },
    dateTextActive: { color: '#FFF' },
});
