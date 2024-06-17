import axios from 'axios';

// Mockstagram API Url
const API_URL = "http://localhost:3000/api/v1/influencers/";

interface InfluencerData {
  id: number;
  followerCount: number;
}

export class MockstagramClient {

  async fetchFollowerCount(id: number) {
    let data: InfluencerData = { id: 0, followerCount: 0 };
    try {
      const response = await axios.get(API_URL + id);
      data.id = response.data.pk;
      data.followerCount = response.data.followerCount;
    } catch (err) {
      //logger.error(`Error fetching follower count for influencer ${id}: ${err}`);
    }

    return data;
  }
}


