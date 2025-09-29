
import { NewsCluster } from '../types';

export const newsClusters: NewsCluster[] = [
  {
    id: 'cluster-1',
    topic: 'Breakthrough in Quantum Battery Technology',
    articles: [
      {
        source: 'FutureTechChronicle',
        headline: 'Researchers Announce Quantum Battery with Near-Infinite Charge Cycles',
        content: 'A joint research team from the Institute for Advanced Materials and the University of Geneva has published a paper detailing a stable quantum battery prototype. The device leverages quantum entanglement to store energy, theoretically allowing for millions of charge-recharge cycles without degradation, a significant leap over current lithium-ion technology.'
      },
      {
        source: 'The Independent Scientist',
        headline: 'New Quantum Battery Design Could Revolutionize Energy Storage',
        content: 'Scientists have unveiled a novel battery design that operates on quantum mechanical principles. Unlike conventional batteries that store energy chemically, this new device uses the quantum states of particles. The primary advantage is its incredible longevity and potential for ultra-fast charging. However, scaling the technology for commercial use remains a major hurdle, requiring extremely low temperatures and specialized equipment.'
      }
    ]
  },
  {
    id: 'cluster-2',
    topic: 'De-dollarization efforts by BRICS nations',
    articles: [
      {
        source: 'Global South Press',
        headline: 'BRICS Summit Concludes with Renewed Push for Alternative Currency',
        content: 'Leaders from Brazil, Russia, India, China, and South Africa have concluded their annual summit with a strong statement on reducing reliance on the US dollar for international trade. The bloc announced plans to accelerate the development of a shared payment system and explore a common reserve currency backed by a basket of commodities.'
      },
      {
        source: 'Emerging Markets Daily',
        headline: 'Is the Dollar\'s Dominance Under Threat? BRICS Nations Double Down on De-dollarization',
        content: 'The move by BRICS to create trade mechanisms outside the dollar-based system is gaining momentum. Financial analysts note that while the dollar\'s role as the world\'s primary reserve currency is not immediately at risk, the trend towards regional currency blocs is undeniable and could reshape global finance over the next decade.'
      },
      {
        source: 'Sovereign Watch',
        headline: 'Geopolitical Shift: BRICS Payment System Challenges SWIFT',
        content: 'A key outcome of the recent BRICS meeting is the formalization of a project to build an alternative to the SWIFT banking communication system. This initiative is aimed at insulating member economies from potential US and European sanctions and represents a significant step in creating a multi-polar financial world.'
      }
    ]
  },
  {
    id: 'cluster-3',
    topic: 'Advancements in Vertical Farming and Urban Agriculture',
    articles: [
      {
        source: 'UrbanAgri Digest',
        headline: 'Singaporean Startup Achieves Record Yields in AI-Powered Vertical Farm',
        content: 'AeroFarms SG, a leader in urban agriculture, has reported a 30% increase in crop yields for leafy greens using a new AI-driven system. The system optimizes light, water, and nutrient delivery in real-time for each plant, drastically reducing resource consumption while boosting output in their high-rise farm.'
      },
      {
        source: 'The Resilient City',
        headline: 'Vertical Farms Prove Essential During Recent Supply Chain Disruptions',
        content: 'Cities with established vertical farming infrastructure demonstrated greater food resilience during the recent global shipping crisis. These indoor farms provided a stable supply of fresh produce locally, bypassing logistical bottlenecks and highlighting the importance of decentralized food production for urban centers.'
      }
    ]
  },
  {
    id: 'cluster-4',
    topic: 'Discovery of a new exoplanet with potential for liquid water',
    articles: [
      {
        source: 'Cosmos Today',
        headline: 'Kepler-186f Sibling? Astronomers Find Earth-Sized Planet in Habitable Zone',
        content: 'Using data from the TESS telescope, an international team of astronomers has confirmed the existence of a new exoplanet, named "Triton-X", orbiting a red dwarf star just 30 light-years away. The planet is roughly 1.2 times the size of Earth and orbits within its star\'s habitable zone, the region where temperatures could allow for liquid water to exist on the surface.'
      },
      {
        source: 'Astro-Physical Journal Letters',
        headline: 'Spectrographic Analysis of Triton-X Atmosphere Shows Water Vapor Traces',
        content: 'Preliminary analysis of the light passing through Triton-X\'s atmosphere suggests the presence of water vapor. While this is not definitive proof of surface oceans, it is the most promising sign yet in the search for habitable worlds beyond our solar system. Further observation with the James Webb Space Telescope is planned to confirm the findings.'
      }
    ]
  }
];
