import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Smart Duty Management',
    description: 'Assign, track, and complete cleaning tasks effortlessly as a team',
    image: require('../assets/images/Landing1.png'),
  },
  {
    id: '2',
    title: 'Schedule Duties Easily',
    description: 'Divide cleaning tasks by day and keep everything on track',
    image: require('../assets/images/Landing2.png'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = () => {
    router.replace('/auth');
  };

  const handleGetStarted = () => {
    router.replace('/auth');
  };

  const handleSignUp = () => {
    router.replace('/auth');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/Logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>

      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Add Image Here</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.noAccountText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 60,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#2196F3',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D0D0D0',
  },
  getStartedButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 20,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 14,
    color: '#666',
  },
  signUpText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
});
