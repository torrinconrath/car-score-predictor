import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getScoreRating } from "../utils/scoreRating";
import { fetchConfig } from "../utils/fetchConfig";

export default function TabTwoScreen() {

  const [description, setDescription] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);

  const handlePredict = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a car description');
      return;
    }

    const priceMatch = description.match(/\$([0-9,]+)/);
    if (priceMatch) {
        const priceValue = parseFloat(priceMatch[1].replace(/,/g, ''));
        setPrice(priceValue);
    } else {
        setPrice(null);
    }

    if (!price) { 
        Alert.alert('Error', 'Please enter more information'); 
        return; 
    }

    setIsLoading(true);
    try {
      const config = await fetchConfig();
      const response = await fetch(`http://${(config).ip}:${(config).port}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (response.ok) {
        setScore(data.score);
      } else {
        throw new Error(data.error || 'Failed to get prediction');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
      setScore(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <AntDesign
          size={410}
          color="#808080"
          name="questioncircleo"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{textAlign: 'center'}}>
          Car Score Predictor
        </ThemedText>
      </ThemedView>


      {/* Text input for car description */}
      <ThemedView style={styles.inputContainer}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          Describe your car: (Ex: Used 2022 Toyota Camry with 100,000 miles, priced at $14,000 at Washington Autos)
        </ThemedText>
        <TextInput
          style={[styles.input, { color: 'white' }]}
          multiline
          numberOfLines={4}
          placeholder="Enter car details (year, model, mileage, condition, price, etc.)"
          placeholderTextColor="white"
          value={description}
          onChangeText={setDescription}
        />
      </ThemedView>

      {/* Predict button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePredict}
        disabled={isLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Predicting...' : 'Predict Score'}
        </ThemedText>
      </TouchableOpacity>

      {/* Result display */}
        {score !== null && (
        <ThemedView style={[styles.resultContainer, { borderColor: getScoreRating(score).color }]}>
            
            <ThemedText 
            type="title" 
            style={[styles.resultScore, { color: getScoreRating(score).color }]}
            >
            {score.toFixed(2)}
            </ThemedText>
            
            <ThemedText 
            style={[styles.ratingText, { color: getScoreRating(score).color }]}
            >
            {getScoreRating(score).rating}
            </ThemedText>
        </ThemedView>
        )}


    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#353636',
    borderRadius: 8,
    marginHorizontal: 16,
    borderWidth: 2, 
  },
  resultLabel: {
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 32,
    color: '#007AFF',
  },
  ratingText: {
  fontSize: 18,
  fontWeight: 'bold',
  marginTop: 8,
},
});