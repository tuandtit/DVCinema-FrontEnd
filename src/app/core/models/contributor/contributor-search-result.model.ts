export interface ContributorDto {
  id: number;
  name: string;
  photoUrl: string | null;
  stageName: string;
  gender: 'MALE' | 'FEMALE'; // Giả sử chỉ có hai giá trị
  birthDate: string; // dạng ISO Date string (ví dụ: '1974-08-10')
  introduction: string;
  contributorType: 'ACTOR' | 'DIRECTOR';
}
