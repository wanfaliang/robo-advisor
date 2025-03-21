import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Link,
  Divider,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon, School as SchoolIcon } from '@mui/icons-material';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  published_at: string;
}

interface EducationalContent {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reading_time: number;
}

interface NewsProps {
  portfolioId: number;
}

const News: React.FC<NewsProps> = ({ portfolioId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>([]);

  useEffect(() => {
    fetchContent();
  }, [portfolioId]);

  const fetchContent = async () => {
    try {
      const [newsResponse, educationResponse] = await Promise.all([
        fetch(`http://localhost:8000/api/news`),
        fetch(`http://localhost:8000/api/education`)
      ]);

      if (!newsResponse.ok || !educationResponse.ok) {
        throw new Error('Failed to fetch content');
      }

      const newsData = await newsResponse.json();
      const educationData = await educationResponse.json();

      setNews(newsData.news || []);
      setEducationalContent(educationData.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                icon={<TrendingUpIcon />} 
                label="Market News" 
                iconPosition="start"
              />
              <Tab 
                icon={<SchoolIcon />} 
                label="Educational Content" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {tabValue === 0 ? (
            <Grid container spacing={2}>
              {news.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {item.summary}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center">
                            <Chip 
                              label={item.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Typography variant="caption" color="textSecondary">
                              {new Date(item.published_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Link 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ ml: 2 }}
                        >
                          Read More
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {educationalContent.map((content) => (
                <Grid item xs={12} md={6} key={content.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {content.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {content.description}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip 
                          label={content.category} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={content.difficulty} 
                          size="small" 
                          color={content.difficulty === 'beginner' ? 'success' : 
                                 content.difficulty === 'intermediate' ? 'warning' : 'error'}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {content.reading_time} min read
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default News; 