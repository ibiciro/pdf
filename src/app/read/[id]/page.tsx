import ReaderView from "@/components/reader-view";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

// Mock content for demo
const mockContent = {
  id: '1',
  title: 'The Future of AI in Content Creation',
  author: 'Sarah Chen',
  sessionDuration: 30, // minutes
  content: `
# The Future of AI in Content Creation

## Introduction

Artificial Intelligence is rapidly transforming the landscape of content creation. From automated writing assistants to sophisticated image generators, AI tools are becoming indispensable for creators across all industries.

In this comprehensive guide, we'll explore the current state of AI in content creation, examine the most promising technologies, and discuss what the future holds for creators and consumers alike.

## The Current State of AI Content Tools

### Text Generation

Large Language Models (LLMs) like GPT-4 have revolutionized how we approach writing. These models can:

- Generate coherent, contextually relevant text
- Assist with brainstorming and ideation
- Help overcome writer's block
- Translate content across languages
- Summarize lengthy documents

The quality of AI-generated text has improved dramatically over the past few years. What once produced awkward, robotic prose now creates content that can be difficult to distinguish from human writing.

### Image Generation

Tools like DALL-E, Midjourney, and Stable Diffusion have democratized visual content creation. Artists and non-artists alike can now:

- Create custom illustrations in seconds
- Generate product mockups
- Design marketing materials
- Produce concept art for projects

### Video and Audio

AI is also making inroads into video and audio production:

- Voice cloning and text-to-speech
- Automated video editing
- Music composition
- Sound effect generation

## The Impact on Creators

### Opportunities

AI tools present numerous opportunities for content creators:

1. **Increased Productivity**: Automate repetitive tasks and focus on high-value creative work
2. **Lower Barriers to Entry**: Create professional-quality content without extensive training
3. **New Revenue Streams**: Offer AI-enhanced services to clients
4. **Experimentation**: Quickly prototype ideas before committing resources

### Challenges

However, these tools also present challenges:

1. **Quality Control**: AI output requires human oversight and editing
2. **Authenticity Concerns**: Audiences may question the value of AI-assisted content
3. **Copyright Issues**: Legal frameworks are still catching up with technology
4. **Job Displacement**: Some roles may become automated

## Best Practices for AI-Assisted Content Creation

### 1. Use AI as a Tool, Not a Replacement

The most successful creators use AI to augment their capabilities, not replace their unique voice and perspective. Think of AI as a powerful assistant that can handle routine tasks while you focus on strategy and creativity.

### 2. Always Review and Edit

Never publish AI-generated content without thorough review. Check for:

- Factual accuracy
- Tone and voice consistency
- Logical flow
- Originality

### 3. Be Transparent

Consider disclosing when AI tools have been used in content creation. Transparency builds trust with your audience.

### 4. Stay Updated

The AI landscape evolves rapidly. Dedicate time to learning about new tools and techniques.

## The Future Outlook

### Short-term (1-2 years)

- More sophisticated writing assistants
- Better integration with existing workflows
- Improved image generation quality
- Wider adoption across industries

### Medium-term (3-5 years)

- Real-time video generation
- Personalized content at scale
- AI-human collaborative tools
- New content formats enabled by AI

### Long-term (5+ years)

- Fully autonomous content creation systems
- Hyper-personalized media experiences
- New creative paradigms we can't yet imagine

## Conclusion

AI is not replacing human creativity—it's amplifying it. The creators who thrive in this new landscape will be those who learn to effectively collaborate with AI tools while maintaining their unique human perspective.

The future of content creation is not human vs. machine, but human with machine. Embrace the tools, understand their limitations, and use them to create content that was previously impossible.

---

*Thank you for reading. If you found this content valuable, please consider leaving a review and sharing it with others who might benefit.*
  `,
};

export default async function ReadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <ReaderView content={mockContent} />;
}
