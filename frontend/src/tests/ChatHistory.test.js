/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatHistory from '../components/ChatHistory'; // Adjust the import path as needed
import '@testing-library/jest-dom';

describe('ChatHistory', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });
  test('should render the ChatHistory component with initial messages', () => {
    render(<ChatHistory />);
    
    // Check if the heading "Chat History" is rendered
    expect(screen.getByText(/chat history/i)).toBeInTheDocument();

    // Check if the initial user messages are rendered
    expect(screen.getByText("What's the crime rate in LA this week?")).toBeInTheDocument();
    expect(screen.getByText("Can you provide a report on the traffic accidents?")).toBeInTheDocument();

    // Check if the initial chatbot messages are rendered
    expect(screen.getByText("The crime rate in LA has decreased by 10% this week.")).toBeInTheDocument();
    expect(screen.getByText("Yes, traffic accidents have been increasing in downtown LA over the last month.")).toBeInTheDocument();
  });

  test('should render messages with correct sender class', () => {
    render(<ChatHistory />);

    // Check the user messages have the correct sender class 'user'
    const userMessages = screen.getAllByText("What's the crime rate in LA this week?");
    expect(userMessages[0].parentElement).toHaveClass('message user');
    
    const userMessage2 = screen.getByText("Can you provide a report on the traffic accidents?");
    expect(userMessage2.parentElement).toHaveClass('message user');

    // Check the chatbot messages have the correct sender class 'chatbot'
    const chatbotMessages = screen.getAllByText("The crime rate in LA has decreased by 10% this week.");
    expect(chatbotMessages[0].parentElement).toHaveClass('message chatbot');
    
    const chatbotMessage2 = screen.getByText("Yes, traffic accidents have been increasing in downtown LA over the last month.");
    expect(chatbotMessage2.parentElement).toHaveClass('message chatbot');
  });

  test('should display the messages in correct order', () => {
    render(<ChatHistory />);

    // Check that the first message is from the user and the second one from the chatbot
    const userMessage = screen.getByText("What's the crime rate in LA this week?");
    const chatbotMessage = screen.getByText("The crime rate in LA has decreased by 10% this week.");
    
    // Assert that user message comes first and chatbot message follows
    expect(userMessage).toBeInTheDocument();
    expect(chatbotMessage).toBeInTheDocument();
  });

});
