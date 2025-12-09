/**
 * Seed script to add sample categories and instruments.
 * Run: npm run seed
 * Ensure MONGO_URI is set in .env
 */

require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Instrument = require('./models/Instrument');

async function seed() {
  await connectDB(process.env.MONGO_URI);
  await Category.deleteMany({});
  await Instrument.deleteMany({});

  const cats = await Category.insertMany([
    { name: 'Oscilloscopes', description: 'High precision oscilloscopes for lab and field use', image: 'https://via.placeholder.com/600x400?text=Oscilloscopes' },
    { name: 'Multimeters', description: 'Digital multimeters with wide-range measurement', image: 'https://via.placeholder.com/600x400?text=Multimeters' },
    { name: 'Power Supplies', description: 'Bench power supplies with fine control', image: 'https://via.placeholder.com/600x400?text=Power+Supplies' }
  ]);

  const instruments = [
    {
      name: 'VegaScope 3000',
      categoryId: cats[0]._id,
      description: '300MHz, 4-channel oscilloscope with advanced triggering.',
      specifications: [{key:'Bandwidth', value:'300 MHz'}, {key:'Channels', value:'4'}, {key:'Sample Rate', value:'2 GS/s'}],
      image: 'https://via.placeholder.com/800x500?text=VegaScope+3000',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      inStock: true
    },
    {
      name: 'Vega DMM Pro',
      categoryId: cats[1]._id,
      description: 'True RMS multimeter with auto-ranging and temperature sensor.',
      specifications: [{key:'DC Voltage', value:'1000 V'}, {key:'Resistance', value:'60 MΩ'}],
      image: 'https://via.placeholder.com/800x500?text=Vega+DMM+Pro',
      videoUrl: '',
      inStock: true
    },
    {
      name: 'Vega PSU 500',
      categoryId: cats[2]._id,
      description: '500W programmable bench power supply with OVP and OCP.',
      specifications: [{key:'Max Power', value:'500 W'}, {key:'Voltage', value:'0-60 V'}],
      image: 'https://via.placeholder.com/800x500?text=Vega+PSU+500',
      videoUrl: '',
      inStock: false
    }
  ];

  await Instrument.insertMany(instruments);
  console.log('Seed complete');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
