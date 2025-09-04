import { useState } from "react";
import type { StoryData } from "./types";
import Editor from './Editor';
import PublishStory from './PublishStory';
import { createStory, updateStory } from "../../services/storyService";
import { useNavigate } from "react-router-dom";

export const Write = () => {
    const [step, setStep] = useState<"editor" | "publish">("editor");
    const [storyData, setStoryData] = useState<StoryData>({
        title: "",
        subtitle: "",
        content: "",
        excerpt: "",
        tags: [],
        isPremium: false,
        allowComments: true,
        allowClaps: true,
        status: "DRAFT",
        mediaIds: []
    });

    const navigate = useNavigate();

    const updateStoryData = (updates: Partial<StoryData>) => {
        setStoryData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (!storyData.title.trim()) {
            alert("Please add a title before proceeding to publish");
            return;
        }
        setStep("publish");
    };

    const handlePublish = async () => {
        try {
            const payload: StoryData = {
                ...storyData,
                status: "PUBLISHED"
            };

            let result;
            if (storyData.id) {
                result = await updateStory(storyData.id, payload);
            } else {
                result = await createStory(payload);
            }

            console.log("Story published successfully:", result);
            alert("Story published successfully!");
            
            setStoryData(prev => ({ ...prev, ...result, status: "PUBLISHED" }));
            
            navigate(`/${result.author.username}/about`);
            
        } catch (error: any) {
            console.error("Publishing error:", error);
            alert(`Failed to publish story: ${error.message || "Please try again."}`);
        }
    };

    return (
        <div className="h-screen w-full">
            {step === "editor" && (
                <Editor 
                    story={storyData}
                    onUpdate={setStoryData}
                    onNext={handleNext}
                />
            )}
            
            {step === "publish" && (
                <PublishStory
                    story={storyData}
                    onUpdate={updateStoryData}
                    onBack={() => setStep("editor")}
                    onPublish={handlePublish}
                />
            )}
        </div>
    );
};