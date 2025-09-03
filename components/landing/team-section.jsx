import { Github, Linkedin, Twitter } from "lucide-react";

const TeamSection = ({
  heading = "Meet Our Team",
  description = "Our dedicated team of engineers and QA experts brings together decades of experience in test automation, DevOps, and software reliability engineering.",
  members = [
    {
      id: "member-2",
      name: "Asmi",
      role: "Co-Lead Engineer",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
      github: "#",
      twitter: "#",
      linkedin: "#",
    },
    {
      id: "member-3",
      name: "Disha Patil",
      role: "Kalyan warrior",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-7.webp",
      github: "#",
      twitter: "#",
      linkedin: "#",
    },
    {
      id: "member-1",
      name: "Vansh Agarwal",
      role: "Project ka Malik",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
      github: "#",
      twitter: "#",
      linkedin: "#",
    },
    {
      id: "member-5",
      name: "Sanjana ",
      role: "Doc master",
      avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-8.webp",
      github: "#",
      twitter: "#",
      linkedin: "#",
    },
    
  ],
}) => {
  return (
    <section className="py-24 sm:py-28 lg:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight lg:text-5xl">
            {heading}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="p-6 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <div className="size-20 lg:size-24 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="size-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
                  <p className="text-primary text-sm font-medium">
                    {member.role}
                  </p>
                </div>

                <div className="flex gap-3">
                  {member.github && (
                    <a
                      href={member.github}
                      className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition-colors"
                      aria-label={`${member.name}'s GitHub`}
                    >
                      <Github className="text-muted-foreground hover:text-foreground size-4 transition-colors" />
                    </a>
                  )}
                  {member.twitter && (
                    <a
                      href={member.twitter}
                      className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition-colors"
                      aria-label={`${member.name}'s Twitter`}
                    >
                      <Twitter className="text-muted-foreground hover:text-foreground size-4 transition-colors" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      className="bg-muted/50 hover:bg-muted rounded-lg p-2 transition-colors"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin className="text-muted-foreground hover:text-foreground size-4 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { TeamSection };
