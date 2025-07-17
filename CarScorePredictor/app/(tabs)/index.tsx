import { Image } from 'expo-image';
import {StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/car2.png')}
          style={styles.reactLogo}
          contentFit='cover'
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to the Car Score Predictor</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Predict Tab</ThemedText>
        <ThemedText>
          The Predict Tab holds a text input LLM to output a inputted car's value. {"\n"}
          For the best performance include at least the year, model, mileage, and price to get an accurate score. {"\n"}
          The model handles Year, Model, Mileage, Price, Condition, Dealer, Monthly Payment, Accident History, Number of Owners, and Personal/Commericial Use directly. {"\n"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Database Tab</ThemedText>
        <ThemedText>
          The Database Tab holds a record of cars gathered by a webscraper to display. {"\n"}
          Used cars with perfect history means they have a clean history, one owner, and no accidents.  {"\n"}
          This can give a sense of deals out their and potentially good deals. {"\n"}
          You can filter by price limits, makes and models, and US states. {"\n"}
          Lastly, the cars are automatically sorted by their projected value as the purpose of this app is to find and identify deals. {"\n"}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">The Future</ThemedText>
        <ThemedText>
          Currently, I cannot deploy this application or utilize better methodologies like Google Maps API, as using web scrapers causes moral issues and potential API request charges. 
          I had to abandon trying to extract the model style, accident and usage history, or owners, due to needing to scrape the individual listing which often didn't contain the needed information.  
          Additionally, I didn't have access to a free, robust deployment service to publish this application to the world.  
           {"\n\n"}
           Lastly, the car value score algorithm doesn't perform ideally due to the limitations of not knowing maintence costs or mileage expectancies over models and other information voided from the listings or the user. 
           The neural network also tends to play it safe on the scores, making a lot of cars hover around the same score giving it an overall worse accuracy than what I wanted given a 1 point tolerance.
           {"\n\n"}
          If you have any questions or concerns email me: 
        </ThemedText>
        <ThemedText
          type="default"
          style={{ color: 'white'}}
          onPress={() => Linking.openURL('torrinconrath@gmail.com')}
        >
          torrinconrath@gmail.com
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: height * 0.3,
    width: width,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
