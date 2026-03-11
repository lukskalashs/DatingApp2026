import { Component } from '@angular/core';
import { FeaturesPage } from '../../types/features-page';

@Component({
  selector: 'app-features',
  imports: [],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class Features {

  readonly model: FeaturesPage = {
  pageTitle: 'DatingApp Features',
  introText: 'Discover what you can do with the DatingApp platform.',

  feature1Title: 'Create Your Profile',
  feature1Description: 'Set up your profile by adding a photo, interests, and a short biography so other members can learn more about you.',
  feature1Category: 'Profile',
  feature1IsNew: false,

  feature2Title: 'Browse Members',
  feature2Description: 'Explore profiles of other members and discover people who share similar interests.',
  feature2Category: 'Core',
  feature2IsNew: false,

  feature3Title: 'Like Profiles',
  feature3Description: 'Show interest in another member by liking their profile. Mutual likes create a match.',
  feature3Category: 'Social',
  feature3IsNew: false,

  feature4Title: 'Private Messaging',
  feature4Description: 'Send private messages to your matches and start meaningful conversations directly in the app.',
  feature4Category: 'Social',
  feature4IsNew: true,

  feature5Title: 'Match Notifications',
  feature5Description: 'Receive notifications when someone likes your profile or when you receive a new message.',
  feature5Category: 'Core',
  feature5IsNew: false,

  feature6Title: 'Privacy Settings',
  feature6Description: 'Control who can see your profile information and manage your visibility within the platform.',
  feature6Category: 'Safety',
  feature6IsNew: true
};
}
