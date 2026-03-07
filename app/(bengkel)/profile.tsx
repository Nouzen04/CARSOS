import { StyleSheet, Text, View } from 'react-native';

export default function BengkelProfile() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bengkel Profile</Text>
            <View style={styles.separator} />
            <Text>Profile settings and details.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
        backgroundColor: '#eee',
    },
});
