# **LA Crime Data Query and Visualization Platform**

The **LA Crime Data Query and Visualization Platform** is a modern web-based application designed to enable users to explore and analyze over 20 years of Los Angeles crime data through intuitive queries and interactive visualizations. Leveraging advanced AI and data processing techniques, the platform combines **Retrieval-Augmented Generation (RAG)**, **Information Retrieval (IR)**, and **OpenAI's GPT API** to transform complex datasets into actionable insights.

## **Key Features**

1. **Natural Language Querying**  
   Users can input natural language questions about crime trends, victim demographics, or specific locations. The platform uses GPT-powered parsing to translate these queries into SQL statements for precise database retrieval.

2. **Dynamic Data Visualization**  
   The application supports multiple visualization formats, including heatmaps, bar charts, pie charts, and histograms, powered by **Highcharts** and **Chart.js**. Users can switch between textual and charted outputs for a tailored data exploration experience.

3. **Scalable Backend**  
   A robust backend built with **FastAPI**, hosted on an AWS EC2 instance, ensures efficient data processing and communication with a PostgreSQL database on Heroku. The backend dynamically retrieves, processes, and formats data for user queries.

4. **Interactive Frontend**  
   A React-based frontend, deployed on **Vercel**, provides a responsive and user-friendly interface for querying data and visualizing results. Users can navigate crime statistics effortlessly through the seamless integration of charting libraries.

5. **Comprehensive Crime Dataset**  
   The platform integrates with the LA City Open Data API, processing and storing nearly 1 million records of crime data. Data preprocessing ensures secure, optimized, and accurate access to the dataset.

## **Purpose**

This platform is designed for:
- **City Officials**: To plan and strategize crime prevention measures
- **Researchers**: To study trends in crime patterns over time.
- **General Public**: To gain insights into local safety and crime statistics.

Whether used for studying trends, identifying hotspots, or generating actionable insights, the **LA Crime Data Query and Visualization Platform** bridges the gap between complex data and user-friendly interaction, promoting transparency, informed decision-making, and public awareness.
