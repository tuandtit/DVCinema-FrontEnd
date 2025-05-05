import { Component, OnInit } from '@angular/core';
import { TopicService } from '../../../core/services/topic.service';

interface Topic {
  id: number;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
})
export class TopicComponent implements OnInit {
  topics: Topic[] = [];

  // Danh sách gradient sáng
  private gradients: string[] = [
    'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(135deg, #f6d365, #fda085)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #d4fc79, #96e6a1)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
    'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    'linear-gradient(135deg, #a6c0fe, #f68084)',
    'linear-gradient(135deg, #f3e7fe, #9df9ef)',
    'linear-gradient(135deg, #ff9a8b, #ff6a88)',
    'linear-gradient(135deg, #d4a5eb, #84b6f4)',
  ];

  constructor(private topicService: TopicService) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.topicService.getTopics().subscribe({
      next: (response) => {
        if (response.status.code !== 200) {
          console.error('Lỗi từ API:', response.status.timestamp);
          return;
        }
        this.topics = response.data;
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách chủ đề:', err);
      },
    });
  }

  getGradientStyle(index: number): { [key: string]: string } {
    const gradient = this.gradients[index % this.gradients.length];
    return {
      background: gradient,
    };
  }
}
